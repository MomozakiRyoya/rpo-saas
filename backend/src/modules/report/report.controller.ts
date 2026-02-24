import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('api/reports/jobs/:id')
  @ApiOperation({ summary: 'ジョブPDFレポート生成' })
  async generateJobReport(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const buffer = await this.reportService.generateJobReport(id, req.user.tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=job-report.pdf',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('api/reports/monthly')
  @ApiOperation({ summary: '月次PDFレポート生成' })
  @ApiQuery({ name: 'month', required: true, type: String, example: '2026-02' })
  async generateMonthlyReport(
    @Query('month') month: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const buffer = await this.reportService.generateMonthlyReport(
      req.user.tenantId,
      month ?? new Date().toISOString().substring(0, 7),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=monthly-report.pdf',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
