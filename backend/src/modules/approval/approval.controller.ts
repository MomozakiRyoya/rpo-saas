import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('approvals')
@Controller('api/approvals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApprovalController {
  constructor(private approvalService: ApprovalService) {}

  @Get()
  @ApiOperation({ summary: '承認待ち一覧取得' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.approvalService.findAll(req.user.tenantId, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: '承認詳細取得' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.approvalService.findOne(id, req.user.tenantId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '承認実行' })
  async approve(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req,
  ) {
    return this.approvalService.approve(id, req.user.tenantId, req.user.userId, body.comment);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '差戻し' })
  async reject(
    @Param('id') id: string,
    @Body() body: { comment: string },
    @Request() req,
  ) {
    return this.approvalService.reject(id, req.user.tenantId, req.user.userId, body.comment);
  }
}
