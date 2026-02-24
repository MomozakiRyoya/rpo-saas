import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApplicationStage } from '@prisma/client';

@ApiTags('candidates')
@Controller('api/candidates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Get()
  @ApiOperation({ summary: '候補者一覧取得' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'stage', required: false, enum: ApplicationStage })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'jobId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req,
    @Query('q') q?: string,
    @Query('stage') stage?: ApplicationStage,
    @Query('tag') tag?: string,
    @Query('jobId') jobId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.candidateService.findAll(
      req.user.tenantId,
      { q, stage, tag, jobId },
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post()
  @ApiOperation({ summary: '候補者作成' })
  async create(
    @Body()
    body: {
      name: string;
      email?: string;
      phone?: string;
      skills?: string[];
      tags?: string[];
      notes?: string;
    },
    @Request() req,
  ) {
    return this.candidateService.create(req.user.tenantId, req.user.id, body);
  }

  @Get('applications/:id/stage')
  // ルート衝突防止のため :id エンドポイントより先に定義
  @ApiOperation({ summary: 'ダミー - 以下のPATCHを使用' })
  async noop() {
    return {};
  }

  @Get(':id')
  @ApiOperation({ summary: '候補者詳細取得' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.candidateService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '候補者更新' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      skills?: string[];
      tags?: string[];
      notes?: string;
      score?: number;
      resumeUrl?: string;
    },
    @Request() req,
  ) {
    return this.candidateService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '候補者削除' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.candidateService.delete(id, req.user.tenantId);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: '候補者の応募一覧取得' })
  async getApplications(@Param('id') id: string, @Request() req) {
    return this.candidateService.getApplications(id, req.user.tenantId);
  }

  @Post(':id/link-job')
  @ApiOperation({ summary: '候補者を求人に紐付け' })
  async linkToJob(
    @Param('id') id: string,
    @Body() body: { jobId: string },
    @Request() req,
  ) {
    return this.candidateService.linkToJob(
      req.user.tenantId,
      id,
      body.jobId,
    );
  }

  @Patch('applications/:id/stage')
  @ApiOperation({ summary: '応募ステージ更新' })
  async updateStage(
    @Param('id') id: string,
    @Body() body: { stage: ApplicationStage },
    @Request() req,
  ) {
    return this.candidateService.updateStage(
      req.user.tenantId,
      id,
      body.stage,
    );
  }
}
