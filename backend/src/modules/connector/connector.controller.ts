import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectorService } from './connector.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('connectors')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConnectorController {
  constructor(private connectorService: ConnectorService) {}

  @Get('connectors')
  @ApiOperation({ summary: 'コネクタ一覧取得' })
  async findAll() {
    return this.connectorService.findAll();
  }

  @Post('publications')
  @ApiOperation({ summary: '掲載作成・実行' })
  async createPublication(
    @Body() body: { jobId: string; connectorId: string },
    @Request() req,
  ) {
    return this.connectorService.createPublication(body.jobId, body.connectorId, req.user.tenantId);
  }

  @Post('publications/:id/stop')
  @ApiOperation({ summary: '掲載停止' })
  async stopPublication(@Param('id') id: string, @Request() req) {
    return this.connectorService.stopPublication(id, req.user.tenantId);
  }
}
