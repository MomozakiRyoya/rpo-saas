import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class WebhookInboundService {
  constructor(private prisma: PrismaService) {}

  async receiveInquiry(source: string, payload: any) {
    // 媒体ごとのペイロードを正規化
    let normalized: {
      externalId?: string;
      applicantName?: string;
      applicantEmail?: string;
      content: string;
      jobExternalId?: string;
    };

    if (source === "indeed") {
      normalized = {
        externalId: payload.application_id || payload.inquiry_id,
        applicantName: payload.applicant_name || payload.name,
        applicantEmail: payload.applicant_email || payload.email,
        content: payload.message || payload.cover_letter || "Indeed経由の問い合わせ",
        jobExternalId: payload.job_id,
      };
    } else if (source === "kyujin-box") {
      normalized = {
        externalId: payload.inquiry_id,
        applicantName: payload.applicant?.name,
        applicantEmail: payload.applicant?.email,
        content: payload.content || payload.message || "求人ボックス経由の問い合わせ",
        jobExternalId: payload.job_id,
      };
    } else {
      return { received: true, skipped: true };
    }

    // externalId で重複チェック
    if (normalized.externalId) {
      const exists = await this.prisma.inquiry.findFirst({
        where: { externalId: normalized.externalId, source },
      });
      if (exists) return { received: true, duplicate: true };
    }

    // 求人を特定（externalId から）
    let jobId: string | null = null;
    let publicationId: string | null = null;
    if (normalized.jobExternalId) {
      const publication = await this.prisma.publication.findFirst({
        where: { externalId: normalized.jobExternalId },
        include: { connector: { select: { type: true } } },
      });
      if (publication) {
        jobId = publication.jobId;
        publicationId = publication.id;
      }
    }

    // tenantId を Publication/Job 経由で取得
    let tenantId: string | null = null;
    if (jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: jobId },
        include: { customer: { select: { tenantId: true } } },
      });
      tenantId = job?.customer?.tenantId || null;
    }

    // 候補者の自動作成または検索
    let candidateId: string | null = null;
    if (tenantId && normalized.applicantEmail) {
      const existing = await this.prisma.candidate.findFirst({
        where: { tenantId, email: normalized.applicantEmail },
      });
      if (existing) {
        candidateId = existing.id;
      } else {
        const newCandidate = await this.prisma.candidate.create({
          data: {
            tenantId,
            name: normalized.applicantName || null,
            email: normalized.applicantEmail,
          },
        });
        candidateId = newCandidate.id;
      }
    }

    const inquiry = await this.prisma.inquiry.create({
      data: {
        source,
        externalId: normalized.externalId || null,
        jobId,
        publicationId,
        candidateId,
        applicantName: normalized.applicantName || null,
        applicantEmail: normalized.applicantEmail || null,
        content: normalized.content,
        status: "RECEIVED",
      },
    });

    return { received: true, inquiryId: inquiry.id };
  }
}
