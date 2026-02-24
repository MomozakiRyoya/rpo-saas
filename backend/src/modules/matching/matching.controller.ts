import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post('api/jobs/:id/match')
  @ApiOperation({ summary: 'AI候補者マッチング' })
  async matchCandidates(@Param('id') id: string, @Request() req) {
    return this.matchingService.matchCandidates(id, req.user.tenantId);
  }
}
