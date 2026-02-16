import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { defaultQueueOptions } from './queue.config';
import {
  QueueName,
  TextGenerationJobData,
  ImageGenerationJobData,
  PublicationJobData,
  EmailJobData,
} from './types/job.types';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queues: Map<QueueName, Queue> = new Map();

  async onModuleInit() {
    try {
      console.log('🔧 Initializing BullMQ queues...');
      console.log('Queue Redis config:', defaultQueueOptions.connection);

      // 各キューを初期化
      this.queues.set(
        QueueName.TEXT_GENERATION,
        new Queue(QueueName.TEXT_GENERATION, defaultQueueOptions),
      );
      this.queues.set(
        QueueName.IMAGE_GENERATION,
        new Queue(QueueName.IMAGE_GENERATION, defaultQueueOptions),
      );
      this.queues.set(
        QueueName.PUBLICATION,
        new Queue(QueueName.PUBLICATION, defaultQueueOptions),
      );
      this.queues.set(
        QueueName.EMAIL,
        new Queue(QueueName.EMAIL, defaultQueueOptions),
      );

      console.log('✅ BullMQ queues initialized');
    } catch (error) {
      console.error('❌ Failed to initialize BullMQ queues:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // クリーンアップ
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    console.log('✅ BullMQ queues closed');
  }

  // テキスト生成ジョブを追加
  async addTextGenerationJob(data: TextGenerationJobData) {
    const queue = this.queues.get(QueueName.TEXT_GENERATION);
    const job = await queue.add('generate-text', data, {
      priority: 1,
    });
    return { jobId: job.id, queueName: QueueName.TEXT_GENERATION };
  }

  // 画像生成ジョブを追加
  async addImageGenerationJob(data: ImageGenerationJobData) {
    const queue = this.queues.get(QueueName.IMAGE_GENERATION);
    const job = await queue.add('generate-image', data, {
      priority: 2,
    });
    return { jobId: job.id, queueName: QueueName.IMAGE_GENERATION };
  }

  // 掲載実行ジョブを追加
  async addPublicationJob(data: PublicationJobData) {
    const queue = this.queues.get(QueueName.PUBLICATION);
    const job = await queue.add('publish-job', data, {
      priority: 3,
    });
    return { jobId: job.id, queueName: QueueName.PUBLICATION };
  }

  // メール送信ジョブを追加
  async addEmailJob(data: EmailJobData) {
    const queue = this.queues.get(QueueName.EMAIL);
    const job = await queue.add('send-email', data, {
      priority: 5,
    });
    return { jobId: job.id, queueName: QueueName.EMAIL };
  }

  // ジョブのステータスを取得
  async getJobStatus(queueName: QueueName, jobId: string) {
    const queue = this.queues.get(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      name: job.name,
      state,
      progress,
      result: returnValue,
      error: failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  // すべてのキューの統計情報を取得
  async getQueueStats() {
    const stats = [];

    for (const [name, queue] of this.queues.entries()) {
      const counts = await queue.getJobCounts();
      stats.push({
        name,
        ...counts,
      });
    }

    return stats;
  }
}
