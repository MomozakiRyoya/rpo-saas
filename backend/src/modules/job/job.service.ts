import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EmailService } from "../email/email.service";
import { CreateJobDto, UpdateJobDto } from "./dto/job.dto";

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  async findAll(
    tenantId: string,
    filters: { status?: string; customerId?: string } = {},
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    // テナントに紐づく顧客のIDリストを取得
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const where: any = {
      customerId: { in: customerIds },
    };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
      include: {
        customer: true,
        textVersions: {
          orderBy: { version: "desc" },
          take: 5,
        },
        imageVersions: {
          orderBy: { version: "desc" },
          take: 5,
        },
        approvals: {
          orderBy: { requestedAt: "desc" },
          take: 5,
          include: {
            reviews: {
              include: {
                reviewer: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        publications: {
          include: {
            connector: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    return job;
  }

  async create(tenantId: string, userId: string, createJobDto: CreateJobDto) {
    // 顧客がテナントに紐づいているか確認
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: createJobDto.customerId,
        tenantId,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    const job = await this.prisma.job.create({
      data: createJobDto,
      include: {
        customer: true,
      },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: "create_job",
      resource: "job",
      resourceId: job.id,
      metadata: { jobTitle: job.title },
    });

    return job;
  }

  async update(
    id: string,
    tenantId: string,
    userId: string,
    updateJobDto: UpdateJobDto,
  ) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: updateJobDto as any,
      include: {
        customer: true,
      },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: "update_job",
      resource: "job",
      resourceId: id,
      metadata: { changes: updateJobDto },
    });

    return updated;
  }

  async delete(id: string, tenantId: string, userId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    await this.prisma.job.delete({
      where: { id },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: "delete_job",
      resource: "job",
      resourceId: id,
      metadata: { jobTitle: job.title },
    });

    return { message: "Job deleted successfully" };
  }

  async submitForApproval(id: string, tenantId: string, userId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
      include: {
        textVersions: {
          orderBy: { version: "desc" },
          take: 1,
        },
        imageVersions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (job.status !== "DRAFT" && job.status !== "GENERATED") {
      throw new BadRequestException(
        "Job is not in a state that can be submitted for approval",
      );
    }

    // 承認申請を作成
    const approval = await this.prisma.approval.create({
      data: {
        jobId: id,
        status: "PENDING",
        textVersion: job.textVersions[0]?.version,
        imageVersion: job.imageVersions[0]?.version,
      },
    });

    // 求人ステータスを更新
    await this.prisma.job.update({
      where: { id },
      data: { status: "PENDING_APPROVAL" },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: "submit_for_approval",
      resource: "job",
      resourceId: id,
      metadata: { approvalId: approval.id },
    });

    // MANAGER/ADMIN ユーザーに承認依頼メールを送信（失敗しても処理継続）
    this.notifyApprovers(tenantId, job.title).catch((err) =>
      console.error("承認依頼メール送信エラー:", err),
    );

    return approval;
  }

  // テナントの MANAGER/ADMIN 全員に承認依頼を通知
  private async notifyApprovers(
    tenantId: string,
    jobTitle: string,
  ): Promise<void> {
    const approvers = await this.prisma.user.findMany({
      where: { tenantId, role: { in: ["ADMIN", "MANAGER"] } },
      select: { email: true, name: true },
    });

    await Promise.allSettled(
      approvers.map((u) =>
        this.emailService.sendApprovalNotification({
          to: u.email,
          userName: u.name,
          jobTitle,
          action: "approved", // テンプレート再利用（件名・本文をsubjectで区別）
          comment: `求人「${jobTitle}」の承認依頼が届いています。管理画面からご確認ください。`,
        }),
      ),
    );
  }

  async getTextVersions(id: string, tenantId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    return this.prisma.jobTextVersion.findMany({
      where: { jobId: id },
      orderBy: { version: "desc" },
    });
  }

  async getImageVersions(id: string, tenantId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    return this.prisma.jobImageVersion.findMany({
      where: { jobId: id },
      orderBy: { version: "desc" },
    });
  }

  async exportCsv(
    tenantId: string,
    filters: { status?: string; customerId?: string } = {},
  ): Promise<string> {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const where: any = { customerId: { in: customerIds } };
    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;

    const jobs = await this.prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    });

    const statusLabels: Record<string, string> = {
      DRAFT: "下書き",
      GENERATED: "生成完了",
      PENDING_APPROVAL: "承認待ち",
      APPROVED: "承認済み",
      PUBLISHING: "掲載実行中",
      PUBLISHED: "掲載中",
      PUBLISH_FAILED: "更新失敗",
      STOPPED: "掲載停止",
    };

    const escape = (val: string | null | undefined): string => {
      if (val == null) return "";
      const str = String(val).replace(/\r?\n/g, " ");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "ID",
      "タイトル",
      "顧客名",
      "ステータス",
      "勤務地",
      "給与",
      "雇用形態",
      "業務内容",
      "応募要件",
      "作成日",
      "更新日",
    ];

    const rows = jobs.map((job) =>
      [
        escape(job.id),
        escape(job.title),
        escape(job.customer?.name),
        escape(statusLabels[job.status] ?? job.status),
        escape(job.location),
        escape(job.salary),
        escape(job.employmentType),
        escape(job.description),
        escape(job.requirements),
        escape(job.createdAt.toLocaleDateString("ja-JP")),
        escape(job.updatedAt.toLocaleDateString("ja-JP")),
      ].join(","),
    );

    return [headers.join(","), ...rows].join("\r\n");
  }

  async getDiff(id: string, tenantId: string, v1: number, v2: number) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const [version1, version2] = await Promise.all([
      this.prisma.jobTextVersion.findUnique({
        where: { jobId_version: { jobId: id, version: v1 } },
      }),
      this.prisma.jobTextVersion.findUnique({
        where: { jobId_version: { jobId: id, version: v2 } },
      }),
    ]);

    if (!version1 || !version2) {
      throw new NotFoundException("Version not found");
    }

    // TODO: 差分計算ロジックを実装（簡易版としてそのまま返す）
    return {
      version1,
      version2,
      // 将来的にdiff-match-patchなどを使って差分を計算
    };
  }
}
