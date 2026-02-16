import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { LlmService } from '../../llm/llm.service';
import { getRedisConfig, defaultWorkerOptions } from '../queue.config';
import { QueueName, ImageGenerationJobData, JobResult } from '../types/job.types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageGenerationProcessor implements OnModuleInit {
  private worker: Worker;

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  onModuleInit() {
    setImmediate(() => {
      try {
        console.log('🔧 Initializing Image generation worker...');
        console.log('Redis config:', getRedisConfig());

        this.worker = new Worker(
          QueueName.IMAGE_GENERATION,
          async (job: Job<ImageGenerationJobData>) => {
            return this.processImageGeneration(job);
          },
          {
            ...defaultWorkerOptions,
            connection: getRedisConfig(),
          },
        );

        this.worker.on('completed', (job) => {
          console.log(`✅ Image generation job ${job.id} completed`);
        });

        this.worker.on('failed', (job, err) => {
          console.error(`❌ Image generation job ${job?.id} failed:`, err.message);
        });

        this.worker.on('error', (err) => {
          console.error('❌ Image generation worker error:', err);
        });

        console.log('✅ Image generation worker started');
      } catch (error) {
        console.error('❌ Failed to initialize Image generation worker:', error);
        console.error('Worker will retry on next restart');
      }
    });
  }

  async onModuleDestroy() {
    await this.worker.close();
  }

  private async processImageGeneration(
    job: Job<ImageGenerationJobData>,
  ): Promise<JobResult> {
    const { jobId, tenantId, prompt } = job.data;

    try {
      await job.updateProgress(10);

      // ジョブを取得
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
      const latestVersion = await this.prisma.jobImageVersion.findFirst({
        where: { jobId },
        orderBy: { version: 'desc' },
      });

      const newVersion = (latestVersion?.version || 0) + 1;

      await job.updateProgress(50);

      // Gemini APIで画像生成
      const imagePrompt =
        prompt ||
        `求人募集の魅力的な画像: ${jobData.title}${jobData.location ? `、${jobData.location}` : ''}`;

      const { imageData, mimeType } = await this.llmService.generateImage({
        prompt: imagePrompt,
        aspectRatio: '16:9',
        imageSize: '2K',
      });

      await job.updateProgress(70);

      // 画像を保存
      const imageUrl = await this.saveImage(
        imageData,
        mimeType,
        `job-${jobId}-v${newVersion}`,
      );

      await job.updateProgress(80);

      // バージョン保存
      const imageVersion = await this.prisma.jobImageVersion.create({
        data: {
          jobId,
          version: newVersion,
          imageUrl: imageUrl,
          prompt: imagePrompt,
          generatedBy: 'ai',
        },
      });

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
          versionId: imageVersion.id,
          version: imageVersion.version,
          imageUrl: imageVersion.imageUrl,
        },
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 画像をファイルとして保存
   */
  private async saveImage(
    imageData: string,
    mimeType: string,
    filename: string,
  ): Promise<string> {
    // 画像保存ディレクトリ
    const uploadDir = path.join(process.cwd(), 'public', 'images');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ファイル拡張子を決定
    const extension = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('jpeg') || mimeType.includes('jpg')
        ? 'jpg'
        : 'png';

    const filepath = path.join(uploadDir, `${filename}.${extension}`);

    // base64データをバッファに変換して保存
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, buffer);

    // 公開URLを返す
    const publicUrl = `/images/${filename}.${extension}`;
    console.log(`✅ Image saved: ${publicUrl}`);

    return publicUrl;
  }
}
