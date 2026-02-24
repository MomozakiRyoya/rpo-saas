import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectorFactory } from '../connector/connectors/connector.factory';

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
      totalApplications: 42,
      averageClickRate: 3.5,
    };
  }

  /**
   * 指定日のメトリクスを全掲載媒体から収集してDBに保存する
   */
  async collectDailyMetrics(targetDate?: Date): Promise<void> {
    const date = targetDate ? new Date(targetDate) : new Date();
    date.setHours(0, 0, 0, 0);

    // アクティブな Publication を全て取得
    const publications = await this.prisma.publication.findMany({
      where: { status: 'PUBLISHED' },
      include: { connector: true },
    });

    for (const pub of publications) {
      if (!pub.externalId) continue;

      try {
        const connector = ConnectorFactory.create(
          pub.connector.type,
          pub.connector.config as Record<string, any>,
        );
        const metrics = await connector.fetchDailyMetrics(pub.externalId, date);

        await this.prisma.dailyMetric.upsert({
          where: {
            date_jobId_connectorId: {
              date,
              jobId: pub.jobId,
              connectorId: pub.connectorId,
            },
          },
          update: {
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            applications: metrics.applications,
            clickRate: metrics.clickRate,
            applicationRate: metrics.applicationRate,
          },
          create: {
            date,
            jobId: pub.jobId,
            connectorId: pub.connectorId,
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            applications: metrics.applications,
            clickRate: metrics.clickRate,
            applicationRate: metrics.applicationRate,
          },
        });
      } catch (err) {
        console.error(`Failed to collect metrics for publication ${pub.id}:`, err);
      }
    }
  }

  /**
   * 毎日0時に日次メトリクスを自動収集する Cron ジョブ
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyMetricsCollection() {
    console.log('Daily metrics collection started');
    await this.collectDailyMetrics();
    console.log('Daily metrics collection completed');
  }
}
