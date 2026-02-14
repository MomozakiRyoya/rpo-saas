import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InquiryService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    // テナント配下の求人に紐づく問い合わせを取得
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);

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
      orderBy: { createdAt: 'desc' },
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
      if (!job) throw new Error('Job not found');
    }

    return this.prisma.inquiry.create({
      data,
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
    });

    if (!inquiry) throw new Error('Inquiry not found');

    // モック返信案生成
    const mockResponse = `お問い合わせありがとうございます。

${inquiry.applicantName}様

お問い合わせいただいた内容について、以下の通りご回答いたします。

【お問い合わせ内容】
${inquiry.content}

【回答】
※この返信案はモックで生成されています。実際のLLM統合時に適切な返信を生成してください。

何かご不明点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。
`;

    const response = await this.prisma.inquiryResponse.create({
      data: {
        inquiryId,
        content: mockResponse,
        generatedBy: 'ai',
      },
    });

    await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: 'DRAFT_READY' },
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
    });

    if (!inquiry) throw new Error('Inquiry not found');

    await this.prisma.inquiryResponse.update({
      where: { id: responseId },
      data: {
        isSent: true,
        sentAt: new Date(),
      },
    });

    await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: 'SENT' },
    });

    return { message: 'Response sent successfully (mock)' };
  }
}
