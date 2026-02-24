import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LlmService } from "../llm/llm.service";
import { QueueService } from "../queue/queue.service";
import { ConnectorFactory } from "../connector/connectors/connector.factory";

@Injectable()
export class InquiryService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
    private queueService: QueueService,
  ) {}

  async findAll(
    tenantId: string,
    filters: { source?: string; status?: string } = {},
  ) {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    return this.prisma.inquiry.findMany({
      where: {
        job: { customerId: { in: customerIds } },
        ...(filters.source ? { source: filters.source } : {}),
        ...(filters.status ? { status: filters.status as any } : {}),
      },
      include: {
        job: { select: { id: true, title: true } },
        candidate: { select: { id: true, name: true, email: true } },
        responses: true,
        publication: {
          select: {
            id: true,
            connector: { select: { id: true, name: true, type: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: any, tenantId: string) {
    if (data.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: data.jobId, customer: { tenantId } },
      });
      if (!job) throw new NotFoundException("Job not found");
    }

    // 候補者の自動作成または紐付け
    let candidateId: string | null = data.candidateId || null;
    if (!candidateId && data.applicantEmail) {
      const existing = await this.prisma.candidate.findFirst({
        where: { tenantId, email: data.applicantEmail },
      });
      if (existing) {
        candidateId = existing.id;
      } else {
        const newCandidate = await this.prisma.candidate.create({
          data: {
            tenantId,
            name: data.applicantName || null,
            email: data.applicantEmail,
          },
        });
        candidateId = newCandidate.id;
      }
    }

    return this.prisma.inquiry.create({
      data: {
        content: data.content,
        jobId: data.jobId || null,
        applicantName: data.applicantName || null,
        applicantEmail: data.applicantEmail || null,
        category: data.category || null,
        source: data.source || "direct",
        externalId: data.externalId || null,
        publicationId: data.publicationId || null,
        candidateId: candidateId || null,
      },
    });
  }

  async generateResponse(inquiryId: string, tenantId: string) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id: inquiryId, job: { customer: { tenantId } } },
      include: { job: { select: { title: true } } },
    });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    const generatedResponse = await this.llmService.generateInquiryResponse({
      applicantName: inquiry.applicantName ?? undefined,
      inquiryContent: inquiry.content,
      jobTitle: inquiry.job?.title,
    });

    const response = await this.prisma.inquiryResponse.create({
      data: { inquiryId, content: generatedResponse, generatedBy: "ai" },
    });

    await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: "DRAFT_READY" },
    });

    return { responseId: response.id, content: response.content };
  }

  async sendResponse(
    inquiryId: string,
    responseId: string,
    tenantId: string,
  ) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id: inquiryId, job: { customer: { tenantId } } },
      include: {
        job: { select: { title: true } },
        publication: { include: { connector: true } },
      },
    });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    const response = await this.prisma.inquiryResponse.findUnique({
      where: { id: responseId },
    });
    if (!response) throw new NotFoundException("Response not found");

    // 媒体経由の返信を試みる
    if (inquiry.externalId && inquiry.publication?.connector) {
      const connector = ConnectorFactory.create(
        inquiry.publication.connector.type,
        inquiry.publication.connector.config as Record<string, any>,
      );
      const result = await connector.replyToInquiry(
        inquiry.externalId,
        response.content,
      );
      if (result.success) {
        await this.updateAfterSend(inquiryId, responseId);
        return {
          message: "Reply sent via connector",
          channel: inquiry.publication.connector.name,
        };
      }
      // コネクタ返信失敗時はメールにフォールバック
    }

    // メール送信
    await this.queueService.addEmailJob({
      to: inquiry.applicantEmail || "applicant@example.com",
      subject: inquiry.job?.title
        ? `【${inquiry.job.title}】お問い合わせへの回答`
        : "お問い合わせへの回答",
      body: response.content,
      template: "inquiry-response",
      data: {
        applicantName: inquiry.applicantName,
        jobTitle: inquiry.job?.title,
      },
    });

    await this.updateAfterSend(inquiryId, responseId);
    return { message: "Response email queued for sending", channel: "email" };
  }

  private async updateAfterSend(
    inquiryId: string,
    responseId: string,
  ): Promise<void> {
    await Promise.all([
      this.prisma.inquiryResponse.update({
        where: { id: responseId },
        data: { isSent: true, sentAt: new Date() },
      }),
      this.prisma.inquiry.update({
        where: { id: inquiryId },
        data: { status: "SENT" },
      }),
    ]);
  }

  async assignCandidate(
    inquiryId: string,
    candidateId: string,
    tenantId: string,
  ) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: { id: inquiryId, job: { customer: { tenantId } } },
    });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    return this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { candidateId },
    });
  }
}
