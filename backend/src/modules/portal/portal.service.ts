import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async getPortalUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, customer: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customerId,
      customerName: user.customer?.name ?? null,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
    };
  }

  async getJobs(customerId: string, status?: string) {
    const where: any = { customerId };
    if (status) where.status = status;

    const jobs = await this.prisma.job.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        approvals: {
          where: { status: 'PENDING' },
          take: 1,
          orderBy: { requestedAt: 'desc' },
        },
        _count: { select: { inquiries: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return jobs;
  }

  async getJobById(customerId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customerId },
      include: {
        customer: { select: { id: true, name: true } },
        textVersions: { orderBy: { version: 'desc' }, take: 1 },
        imageVersions: { orderBy: { version: 'desc' }, take: 1 },
        approvals: {
          orderBy: { requestedAt: 'desc' },
          take: 5,
          include: {
            reviews: {
              include: {
                reviewer: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!job) throw new NotFoundException('Job not found');

    return job;
  }

  async getPendingApprovals(customerId: string) {
    const approvals = await this.prisma.approval.findMany({
      where: {
        status: 'PENDING',
        job: { customerId },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            customerId: true,
            customer: { select: { id: true, name: true } },
          },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return approvals;
  }

  async approveJob(customerId: string, approvalId: string, reviewerId: string) {
    const approval = await this.prisma.approval.findFirst({
      where: { id: approvalId, job: { customerId }, status: 'PENDING' },
      include: { job: true },
    });

    if (!approval) throw new NotFoundException('Approval not found');

    const [updatedApproval] = await this.prisma.$transaction([
      this.prisma.approval.update({
        where: { id: approvalId },
        data: { status: 'APPROVED', completedAt: new Date() },
      }),
      this.prisma.approvalReview.create({
        data: {
          approvalId,
          reviewerId,
          action: 'approve',
          comment: null,
        },
      }),
      this.prisma.job.update({
        where: { id: approval.jobId },
        data: { status: 'APPROVED' },
      }),
    ]);

    return updatedApproval;
  }

  async rejectJob(
    customerId: string,
    approvalId: string,
    reviewerId: string,
    comment: string,
  ) {
    const approval = await this.prisma.approval.findFirst({
      where: { id: approvalId, job: { customerId }, status: 'PENDING' },
      include: { job: true },
    });

    if (!approval) throw new NotFoundException('Approval not found');

    const [updatedApproval] = await this.prisma.$transaction([
      this.prisma.approval.update({
        where: { id: approvalId },
        data: { status: 'REJECTED', completedAt: new Date() },
      }),
      this.prisma.approvalReview.create({
        data: {
          approvalId,
          reviewerId,
          action: 'reject',
          comment,
        },
      }),
      this.prisma.job.update({
        where: { id: approval.jobId },
        data: { status: 'DRAFT' },
      }),
    ]);

    return updatedApproval;
  }

  async getAnalytics(customerId: string) {
    // 自社求人IDを取得
    const jobs = await this.prisma.job.findMany({
      where: { customerId },
      select: { id: true, title: true, status: true },
    });

    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return {
        summary: {
          totalImpressions: 0,
          totalClicks: 0,
          totalApplications: 0,
          avgClickRate: 0,
        },
        byJob: [],
      };
    }

    const metrics = await this.prisma.dailyMetric.groupBy({
      by: ['jobId'],
      where: { jobId: { in: jobIds } },
      _sum: { impressions: true, clicks: true, applications: true },
      _avg: { clickRate: true },
    });

    const totalImpressions = metrics.reduce(
      (s, m) => s + (m._sum.impressions ?? 0),
      0,
    );
    const totalClicks = metrics.reduce(
      (s, m) => s + (m._sum.clicks ?? 0),
      0,
    );
    const totalApplications = metrics.reduce(
      (s, m) => s + (m._sum.applications ?? 0),
      0,
    );
    const avgClickRate =
      totalImpressions > 0
        ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2))
        : 0;

    const byJob = jobs.map((job) => {
      const m = metrics.find((x) => x.jobId === job.id);
      return {
        jobId: job.id,
        title: job.title,
        status: job.status,
        impressions: m?._sum.impressions ?? 0,
        clicks: m?._sum.clicks ?? 0,
        applications: m?._sum.applications ?? 0,
        clickRate: m?._avg.clickRate
          ? parseFloat(m._avg.clickRate.toFixed(2))
          : 0,
      };
    });

    return {
      summary: { totalImpressions, totalClicks, totalApplications, avgClickRate },
      byJob,
    };
  }
}
