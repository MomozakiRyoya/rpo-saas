import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QueueService } from './queue.service';
import { QueueName } from './types/job.types';

@ApiTags('queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('stats')
  @ApiOperation({ summary: 'すべてのキューの統計情報を取得' })
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Get('job/:queueName/:jobId')
  @ApiOperation({ summary: 'ジョブのステータスを取得' })
  async getJobStatus(
    @Param('queueName') queueName: QueueName,
    @Param('jobId') jobId: string,
  ) {
    const status = await this.queueService.getJobStatus(queueName, jobId);

    if (!status) {
      return { message: 'Job not found' };
    }

    return status;
  }
}

// 診断用エンドポイント（認証不要）
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private queueService: QueueService) {}

  @Get()
  @ApiOperation({ summary: 'システム診断情報' })
  async getDiagnostics() {
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const redisHost = process.env.REDIS_HOST || 'not set';
    const redisPort = process.env.REDIS_PORT || 'not set';

    try {
      const queueStats = await this.queueService.getQueueStats();
      return {
        timestamp: new Date().toISOString(),
        version: '2026-02-16-DIAGNOSTICS',
        environment: {
          ANTHROPIC_API_KEY: hasAnthropicKey ? 'SET' : 'MISSING',
          GEMINI_API_KEY: hasGeminiKey ? 'SET' : 'MISSING',
          RESEND_API_KEY: hasResendKey ? 'SET' : 'MISSING',
          REDIS_HOST: redisHost,
          REDIS_PORT: redisPort,
        },
        queue: queueStats,
      };
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        version: '2026-02-16-DIAGNOSTICS',
        environment: {
          ANTHROPIC_API_KEY: hasAnthropicKey ? 'SET' : 'MISSING',
          GEMINI_API_KEY: hasGeminiKey ? 'SET' : 'MISSING',
          RESEND_API_KEY: hasResendKey ? 'SET' : 'MISSING',
          REDIS_HOST: redisHost,
          REDIS_PORT: redisPort,
        },
        queue: { error: error.message },
      };
    }
  }
}
