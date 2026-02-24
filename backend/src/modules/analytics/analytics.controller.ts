import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('daily')
  @ApiOperation({ summary: '日次指標取得' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'connectorId', required: false })
  async getDailyMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('jobId') jobId?: string,
    @Query('connectorId') connectorId?: string,
  ) {
    return this.analyticsService.getDailyMetrics({ startDate, endDate, jobId, connectorId });
  }

  @Get('summary')
  @ApiOperation({ summary: 'サマリー取得' })
  async getSummary(@Request() req) {
    return this.analyticsService.getSummary(req.user.tenantId);
  }

  @Post('collect')
  @ApiOperation({ summary: '日次メトリクス手動収集' })
  async collectMetrics() {
    await this.analyticsService.collectDailyMetrics();
    return { message: 'Metrics collection started' };
  }
}
