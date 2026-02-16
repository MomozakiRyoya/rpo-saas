import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class GenerationService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async generateText(jobId: string, tenantId: string, prompt?: string) {
    // テナントスコープチェック
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    try {
      // BullMQジョブキューに追加
      const queueJob = await this.queueService.addTextGenerationJob({
        jobId,
        tenantId,
        prompt,
      });

      return {
        message: 'Text generation job has been queued',
        queueJobId: queueJob.jobId,
        queueName: queueJob.queueName,
      };
    } catch (error) {
      console.error('Failed to queue text generation job:', error);
      throw new Error(`Queue service error: ${error.message}. Please check Redis connection.`);
    }
  }

  async generateImage(jobId: string, tenantId: string, prompt?: string) {
    // テナントスコープチェック
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    try {
      // BullMQジョブキューに追加
      const queueJob = await this.queueService.addImageGenerationJob({
        jobId,
        tenantId,
        prompt,
      });

      return {
        message: 'Image generation job has been queued',
        queueJobId: queueJob.jobId,
        queueName: queueJob.queueName,
      };
    } catch (error) {
      console.error('Failed to queue image generation job:', error);
      throw new Error(`Queue service error: ${error.message}. Please check Redis connection.`);
    }
  }
}
