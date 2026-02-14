import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('generation')
@Controller('api/generation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenerationController {
  constructor(private generationService: GenerationService) {}

  @Post('text')
  @ApiOperation({ summary: 'テキスト生成実行' })
  async generateText(
    @Body() body: { jobId: string; prompt?: string },
    @Request() req,
  ) {
    return this.generationService.generateText(body.jobId, req.user.tenantId, body.prompt);
  }

  @Post('image')
  @ApiOperation({ summary: '画像生成実行' })
  async generateImage(
    @Body() body: { jobId: string; prompt?: string },
    @Request() req,
  ) {
    return this.generationService.generateImage(body.jobId, req.user.tenantId, body.prompt);
  }
}
