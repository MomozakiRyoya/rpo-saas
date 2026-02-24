import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller()
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post('api/jobs/:id/match')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'AI候補者マッチング' })
  async matchCandidates(@Param('id') id: string, @Request() req) {
    return this.matchingService.matchCandidates(id, req.user.tenantId);
  }
}
