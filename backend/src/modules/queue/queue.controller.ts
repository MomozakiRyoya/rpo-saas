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
