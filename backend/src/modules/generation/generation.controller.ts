import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('generation')
@Controller('api/generation')
export class GenerationController {
  constructor(private generationService: GenerationService) {}

  @Get('version')
  @ApiOperation({ summary: 'コードバージョン確認' })
  getVersion() {
    return {
      version: '2026-02-16-17:30-bullmq',
      timestamp: new Date().toISOString(),
      queueEnabled: true,
    };
  }

  @Post('text')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'テキスト生成実行' })
  async generateText(
    @Body() body: { jobId: string; prompt?: string },
    @Request() req,
  ) {
    return this.generationService.generateText(body.jobId, req.user.tenantId, body.prompt);
  }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '画像生成実行' })
  async generateImage(
    @Body() body: { jobId: string; prompt?: string },
    @Request() req,
  ) {
    return this.generationService.generateImage(body.jobId, req.user.tenantId, body.prompt);
  }
}
