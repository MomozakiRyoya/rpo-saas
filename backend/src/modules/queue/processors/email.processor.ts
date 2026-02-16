import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { EmailService } from '../../email/email.service';
import { getRedisConfig, defaultWorkerOptions } from '../queue.config';
import { QueueName, EmailJobData, JobResult } from '../types/job.types';

@Injectable()
export class EmailProcessor implements OnModuleInit {
  private worker: Worker;

  constructor(private emailService: EmailService) {}

  onModuleInit() {
    try {
      console.log('🔧 Initializing Email worker...');
      console.log('Redis config:', getRedisConfig());

      this.worker = new Worker(
        QueueName.EMAIL,
        async (job: Job<EmailJobData>) => {
          return this.processEmail(job);
        },
        {
          ...defaultWorkerOptions,
          connection: getRedisConfig(),
        },
      );

      this.worker.on('completed', (job) => {
        console.log(`✅ Email job ${job.id} completed`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`❌ Email job ${job?.id} failed:`, err.message);
      });

      this.worker.on('error', (err) => {
        console.error('❌ Email worker error:', err);
      });

      console.log('✅ Email worker started');
    } catch (error) {
      console.error('❌ Failed to initialize Email worker:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.worker.close();
  }

  private async processEmail(job: Job<EmailJobData>): Promise<JobResult> {
    const { to, subject, body, template, data } = job.data;

    try {
      await job.updateProgress(20);

      let result: { success: boolean; messageId?: string };

      // テンプレートに応じて適切なメソッドを呼び出す
      if (template === 'inquiry-response' && data) {
        result = await this.emailService.sendInquiryResponse({
          to,
          applicantName: data.applicantName || '応募者',
          jobTitle: data.jobTitle,
          responseContent: body,
        });
      } else if (template === 'schedule-proposal' && data) {
        result = await this.emailService.sendScheduleProposal({
          to,
          candidateName: data.candidateName || '候補者',
          slots: data.slots.map((s: string) => new Date(s)),
          scheduleId: data.scheduleId,
        });
      } else if (template === 'approval-notification' && data) {
        result = await this.emailService.sendApprovalNotification({
          to,
          userName: data.userName || 'ユーザー',
          jobTitle: data.jobTitle,
          action: data.action,
          comment: data.comment,
        });
      } else {
        // 汎用メール送信（将来の拡張用）
        console.log('📧 Generic email:', { to, subject });
        result = { success: true, messageId: `generic-${Date.now()}` };
      }

      await job.updateProgress(80);

      if (!result.success) {
        throw new Error('Failed to send email');
      }

      await job.updateProgress(100);

      return {
        success: true,
        data: {
          to,
          subject,
          sentAt: new Date().toISOString(),
          messageId: result.messageId,
        },
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
