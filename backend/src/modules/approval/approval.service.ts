import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EmailService } from "../email/email.service";

@Injectable()
export class ApprovalService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  async findAll(tenantId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // テナントに紐づく求人の承認一覧を取得
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const [approvals, total] = await Promise.all([
      this.prisma.approval.findMany({
        where: {
          job: {
            customerId: { in: customerIds },
          },
        },
        skip,
        take: limit,
        orderBy: { requestedAt: "desc" },
        include: {
          job: {
            include: {
              customer: true,
            },
          },
          reviews: {
            include: {
              reviewer: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      }),
      this.prisma.approval.count({
        where: {
          job: {
            customerId: { in: customerIds },
          },
        },
      }),
    ]);

    return {
      data: approvals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const approval = await this.prisma.approval.findFirst({
      where: {
        id,
        job: {
          customer: { tenantId },
        },
      },
      include: {
        job: {
          include: {
            customer: true,
            textVersions: true,
            imageVersions: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException("Approval not found");
    }

    return approval;
  }

  async approve(
    id: string,
    tenantId: string,
    userId: string,
    comment?: string,
  ) {
    const approval = await this.prisma.approval.findFirst({
      where: {
        id,
        job: {
          customer: { tenantId },
        },
      },
      include: {
        job: true,
      },
    });

    if (!approval) {
      throw new NotFoundException("Approval not found");
    }

    if (approval.status !== "PENDING") {
      throw new BadRequestException("Approval is not pending");
    }

    // レビュー記録
    await this.prisma.approvalReview.create({
      data: {
        approvalId: id,
        reviewerId: userId,
        action: "approve",
        comment,
      },
    });

    // 承認ステータス更新
    await this.prisma.approval.update({
      where: { id },
      data: {
        status: "APPROVED",
        completedAt: new Date(),
      },
    });

    // 求人ステータス更新
    await this.prisma.job.update({
      where: { id: approval.jobId },
      data: { status: "APPROVED" },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: "approve_job",
      resource: "approval",
      resourceId: id,
      metadata: { jobId: approval.jobId, comment },
    });

    // 顧客ポータルユーザーにメール通知（失敗しても処理継続）
    this.notifyCustomerUsers(
      approval.job.customerId,
      approval.job.title,
      "approved",
      comment,
    ).catch((err) => console.error("承認通知メール送信エラー:", err));

    return { message: "Approval approved successfully" };
  }

  async reject(id: string, tenantId: string, userId: string, comment: string) {
    const approval = await this.prisma.approval.findFirst({
      where: {
        id,
        job: {
          customer: { tenantId },
        },
      },
      include: {
        job: true,
      },
    });

    if (!approval) {
      throw new NotFoundException("Approval not found");
    }

    if (approval.status !== "PENDING") {
      throw new BadRequestException("Approval is not pending");
    }

    // レビュー記録
    await this.prisma.approvalReview.create({
      data: {
        approvalId: id,
        reviewerId: userId,
        action: "reject",
        comment,
      },
    });

    // 承認ステータス更新
    await this.prisma.approval.update({
      where: { id },
      data: {
        status: "REJECTED",
        completedAt: new Date(),
      },
    });

    // 求人ステータスを下書きに戻す
    await this.prisma.job.update({
      where: { id: approval.jobId },
      data: { status: "DRAFT" },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: "reject_job",
      resource: "approval",
      resourceId: id,
      metadata: { jobId: approval.jobId, comment },
    });

    // 顧客ポータルユーザーにメール通知（失敗しても処理継続）
    this.notifyCustomerUsers(
      approval.job.customerId,
      approval.job.title,
      "rejected",
      comment,
    ).catch((err) => console.error("差し戻し通知メール送信エラー:", err));

    return { message: "Approval rejected successfully" };
  }

  // 顧客に紐づくポータルユーザー全員にメール通知
  private async notifyCustomerUsers(
    customerId: string,
    jobTitle: string,
    action: "approved" | "rejected",
    comment?: string,
  ): Promise<void> {
    const portalUsers = await this.prisma.user.findMany({
      where: { customerId, role: "CUSTOMER" },
      select: { email: true, name: true },
    });

    await Promise.allSettled(
      portalUsers.map((u) =>
        this.emailService.sendApprovalNotification({
          to: u.email,
          userName: u.name,
          jobTitle,
          action,
          comment,
        }),
      ),
    );
  }
}
