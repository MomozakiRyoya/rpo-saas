import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
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
    const customerIds = customers.map(c => c.id);

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
        orderBy: { createdAt: 'desc' },
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
          orderBy: { version: 'desc' },
          take: 5,
        },
        imageVersions: {
          orderBy: { version: 'desc' },
          take: 5,
        },
        approvals: {
          orderBy: { requestedAt: 'desc' },
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
      throw new NotFoundException('Job not found');
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
      throw new NotFoundException('Customer not found');
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
      action: 'create_job',
      resource: 'job',
      resourceId: job.id,
      metadata: { jobTitle: job.title },
    });

    return job;
  }

  async update(id: string, tenantId: string, userId: string, updateJobDto: UpdateJobDto) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
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
      action: 'update_job',
      resource: 'job',
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
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: 'delete_job',
      resource: 'job',
      resourceId: id,
      metadata: { jobTitle: job.title },
    });

    return { message: 'Job deleted successfully' };
  }

  async submitForApproval(id: string, tenantId: string, userId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
      include: {
        textVersions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        imageVersions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'DRAFT' && job.status !== 'GENERATED') {
      throw new BadRequestException('Job is not in a state that can be submitted for approval');
    }

    // 承認申請を作成
    const approval = await this.prisma.approval.create({
      data: {
        jobId: id,
        status: 'PENDING',
        textVersion: job.textVersions[0]?.version,
        imageVersion: job.imageVersions[0]?.version,
      },
    });

    // 求人ステータスを更新
    await this.prisma.job.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
    });

    // 監査ログ
    await this.auditService.log({
      tenantId,
      userId,
      action: 'submit_for_approval',
      resource: 'job',
      resourceId: id,
      metadata: { approvalId: approval.id },
    });

    return approval;
  }

  async getTextVersions(id: string, tenantId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.jobTextVersion.findMany({
      where: { jobId: id },
      orderBy: { version: 'desc' },
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
      throw new NotFoundException('Job not found');
    }

    return this.prisma.jobImageVersion.findMany({
      where: { jobId: id },
      orderBy: { version: 'desc' },
    });
  }

  async getDiff(id: string, tenantId: string, v1: number, v2: number) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
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
      throw new NotFoundException('Version not found');
    }

    // TODO: 差分計算ロジックを実装（簡易版としてそのまま返す）
    return {
      version1,
      version2,
      // 将来的にdiff-match-patchなどを使って差分を計算
    };
  }
}
