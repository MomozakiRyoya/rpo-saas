import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LlmService } from "../llm/llm.service";
import { QueueService } from "../queue/queue.service";

@Injectable()
export class InquiryService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
    private queueService: QueueService,
  ) {}

  async findAll(tenantId: string) {
    // テナント配下の求人に紐づく問い合わせを取得
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    return this.prisma.inquiry.findMany({
      where: {
        job: {
          customerId: { in: customerIds },
        },
      },
      include: {
        job: {
          select: { id: true, title: true },
        },
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: any, tenantId: string) {
    // 求人がテナントに属しているか確認
    if (data.jobId) {
      const job = await this.prisma.job.findFirst({
        where: {
          id: data.jobId,
          customer: { tenantId },
        },
      });
      if (!job) throw new Error("Job not found");
    }

    return this.prisma.inquiry.create({
      data: {
        content: data.content,
        jobId: data.jobId || null,
        applicantName: data.applicantName || null,
        applicantEmail: data.applicantEmail || null,
        category: data.category || null,
      },
    });
  }

  async generateResponse(inquiryId: string, tenantId: string) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        job: {
          customer: { tenantId },
        },
      },
      include: {
        job: {
          select: { title: true },
        },
      },
    });

    if (!inquiry) throw new Error("Inquiry not found");

    // Claude APIを使用して返信案生成
    const generatedResponse = await this.llmService.generateInquiryResponse({
      applicantName: inquiry.applicantName,
      inquiryContent: inquiry.content,
      jobTitle: inquiry.job?.title,
    });

    const response = await this.prisma.inquiryResponse.create({
      data: {
        inquiryId,
        content: generatedResponse,
        generatedBy: "ai",
      },
    });

    await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: "DRAFT_READY" },
    });

    return { responseId: response.id, content: response.content };
  }

  async sendResponse(inquiryId: string, responseId: string, tenantId: string) {
    const inquiry = await this.prisma.inquiry.findFirst({
      where: {
        id: inquiryId,
        job: {
          customer: { tenantId },
        },
      },
      include: {
        job: {
          select: { title: true },
        },
      },
    });

    if (!inquiry) throw new Error("Inquiry not found");

    const response = await this.prisma.inquiryResponse.findUnique({
      where: { id: responseId },
    });

    if (!response) throw new Error("Response not found");

    // メール送信ジョブをキューに追加
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

    // レスポンスを送信済みに更新
    await this.prisma.inquiryResponse.update({
      where: { id: responseId },
      data: {
        isSent: true,
        sentAt: new Date(),
      },
    });

    // 問い合わせステータスを更新
    await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: "SENT" },
    });

    return { message: "Response email queued for sending" };
  }
}
