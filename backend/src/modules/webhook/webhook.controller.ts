import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('webhooks')
@Controller('api/webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Get()
  @ApiOperation({ summary: 'Webhookエンドポイント一覧取得' })
  async findAll(@Request() req) {
    return this.webhookService.findAll(req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Webhookエンドポイント作成' })
  async create(
    @Body() body: { url: string; events: string[] },
    @Request() req,
  ) {
    return this.webhookService.create(req.user.tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Webhookエンドポイント更新' })
  async update(
    @Param('id') id: string,
    @Body() body: { url?: string; events?: string[]; isActive?: boolean },
    @Request() req,
  ) {
    return this.webhookService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Webhookエンドポイント削除' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.webhookService.delete(id, req.user.tenantId);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Webhook配信履歴取得' })
  async getDeliveries(@Param('id') id: string, @Request() req) {
    return this.webhookService.getDeliveries(id, req.user.tenantId);
  }
}
