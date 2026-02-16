import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { LlmService } from '../../llm/llm.service';
import { getRedisConfig, defaultWorkerOptions } from '../queue.config';
import { QueueName, TextGenerationJobData, JobResult } from '../types/job.types';

@Injectable()
export class TextGenerationProcessor implements OnModuleInit {
  private worker: Worker;

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  onModuleInit() {
    try {
      console.log('🔧 Initializing Text generation worker...');
      console.log('Redis config:', getRedisConfig());

      this.worker = new Worker(
        QueueName.TEXT_GENERATION,
        async (job: Job<TextGenerationJobData>) => {
          return this.processTextGeneration(job);
        },
        {
          ...defaultWorkerOptions,
          connection: getRedisConfig(),
        },
      );

      this.worker.on('completed', (job) => {
        console.log(`✅ Text generation job ${job.id} completed`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`❌ Text generation job ${job?.id} failed:`, err.message);
      });

      this.worker.on('error', (err) => {
        console.error('❌ Text generation worker error:', err);
      });

      console.log('✅ Text generation worker started');
    } catch (error) {
      console.error('❌ Failed to initialize Text generation worker:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.worker.close();
  }

  private async processTextGeneration(
    job: Job<TextGenerationJobData>,
  ): Promise<JobResult> {
    const { jobId, tenantId, prompt } = job.data;

    try {
      // 進捗を更新
      await job.updateProgress(10);

      // ジョブを取得（テナントスコープチェック）
      const jobData = await this.prisma.job.findFirst({
        where: {
          id: jobId,
          customer: { tenantId },
        },
      });

      if (!jobData) {
        throw new Error('Job not found or access denied');
      }

      await job.updateProgress(30);

      // 最新バージョン番号を取得
      const latestVersion = await this.prisma.jobTextVersion.findFirst({
        where: { jobId },
        orderBy: { version: 'desc' },
      });

      const newVersion = (latestVersion?.version || 0) + 1;

      await job.updateProgress(50);

      // Claude APIを使用してテキスト生成
      const generatedContent = await this.llmService.generateJobText({
        title: jobData.title,
        location: jobData.location,
        salary: jobData.salary,
        employmentType: jobData.employmentType,
        description: jobData.description,
        requirements: jobData.requirements,
        customPrompt: prompt,
      });

      await job.updateProgress(70);

      // バージョン保存
      const textVersion = await this.prisma.jobTextVersion.create({
        data: {
          jobId,
          version: newVersion,
          content: generatedContent,
          generatedBy: 'ai',
        },
      });

      await job.updateProgress(90);

      // 求人ステータス更新
      if (jobData.status === 'DRAFT') {
        await this.prisma.job.update({
          where: { id: jobId },
          data: { status: 'GENERATED' },
        });
      }

      await job.updateProgress(100);

      return {
        success: true,
        data: {
          versionId: textVersion.id,
          version: textVersion.version,
          content: textVersion.content,
        },
      };
    } catch (error) {
      console.error('Text generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
