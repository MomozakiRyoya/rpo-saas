import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDailyMetrics(filters: {
    startDate?: string;
    endDate?: string;
    jobId?: string;
    connectorId?: string;
  }) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.connectorId) where.connectorId = filters.connectorId;

    const metrics = await this.prisma.dailyMetric.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return { metrics };
  }

  async getSummary(tenantId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);

    const [totalJobs, publishedJobs] = await Promise.all([
      this.prisma.job.count({
        where: { customerId: { in: customerIds } },
      }),
      this.prisma.job.count({
        where: {
          customerId: { in: customerIds },
          status: 'PUBLISHED',
        },
      }),
    ]);

    // モックデータ
    return {
      totalJobs,
      publishedJobs,
      totalApplications: 42, // モック
      averageClickRate: 3.5, // モック
    };
  }
}
