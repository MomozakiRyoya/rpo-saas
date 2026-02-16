import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConnectorFactory } from '../../connector/connectors/connector.factory';
import { getRedisConfig, defaultWorkerOptions } from '../queue.config';
import { QueueName, PublicationJobData, JobResult } from '../types/job.types';

@Injectable()
export class PublicationProcessor implements OnModuleInit {
  private worker: Worker;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    try {
      console.log('🔧 Initializing Publication worker...');
      console.log('Redis config:', getRedisConfig());

      this.worker = new Worker(
        QueueName.PUBLICATION,
        async (job: Job<PublicationJobData>) => {
          return this.processPublication(job);
        },
        {
          ...defaultWorkerOptions,
          connection: getRedisConfig(),
        },
      );

      this.worker.on('completed', (job) => {
        console.log(`✅ Publication job ${job.id} completed`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`❌ Publication job ${job?.id} failed:`, err.message);
      });

      this.worker.on('error', (err) => {
        console.error('❌ Publication worker error:', err);
      });

      console.log('✅ Publication worker started');
    } catch (error) {
      console.error('❌ Failed to initialize Publication worker:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.worker.close();
  }

  private async processPublication(
    job: Job<PublicationJobData>,
  ): Promise<JobResult> {
    const { publicationId, jobId, connectorId, tenantId } = job.data;

    try {
      await job.updateProgress(10);

      // Publicationを取得
      const publication = await this.prisma.publication.findFirst({
        where: {
          id: publicationId,
          job: {
            customer: { tenantId },
          },
        },
        include: {
          job: true,
          connector: true,
        },
      });

      if (!publication) {
        throw new Error('Publication not found or access denied');
      }

      await job.updateProgress(30);

      // ステータスを「掲載中」に更新
      await this.prisma.publication.update({
        where: { id: publicationId },
        data: { status: 'PUBLISHING' },
      });

      await job.updateProgress(50);

      // コネクタを使用して実際の媒体APIに掲載
      const connector = ConnectorFactory.create(
        publication.connector.type,
        publication.connector.config as Record<string, any>,
      );

      const result = await connector.publish({
        title: publication.job.title,
        description: publication.job.description || '',
        location: publication.job.location || undefined,
        salary: publication.job.salary || undefined,
        employmentType: publication.job.employmentType || undefined,
        requirements: publication.job.requirements || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Publication failed');
      }

      const externalId = result.externalId;

      await job.updateProgress(70);

      // 掲載完了
      await this.prisma.publication.update({
        where: { id: publicationId },
        data: {
          status: 'PUBLISHED',
          externalId,
          publishedAt: new Date(),
        },
      });

      // ログ記録
      await this.prisma.publicationLog.create({
        data: {
          publicationId,
          action: 'create',
          status: 'success',
          request: { jobId, connectorId },
          response: { externalId },
        },
      });

      await job.updateProgress(90);

      // 求人ステータス更新
      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'PUBLISHED' },
      });

      await job.updateProgress(100);

      return {
        success: true,
        data: {
          publicationId,
          externalId,
          status: 'PUBLISHED',
        },
      };
    } catch (error) {
      console.error('Publication error:', error);

      // エラー時の処理
      await this.prisma.publication.update({
        where: { id: publicationId },
        data: { status: 'FAILED' },
      });

      await this.prisma.publicationLog.create({
        data: {
          publicationId,
          action: 'create',
          status: 'failed',
          errorMessage: error.message,
        },
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
