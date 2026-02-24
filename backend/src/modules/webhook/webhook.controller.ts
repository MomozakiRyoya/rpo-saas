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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('webhooks')
@Controller('api/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Get()
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Webhookエンドポイント一覧取得（MANAGER以上）' })
  async findAll(@Request() req) {
    return this.webhookService.findAll(req.user.tenantId);
  }

  @Post()
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Webhookエンドポイント作成（MANAGER以上）' })
  async create(
    @Body() body: { url: string; events: string[] },
    @Request() req,
  ) {
    return this.webhookService.create(req.user.tenantId, body);
  }

  @Patch(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Webhookエンドポイント更新（MANAGER以上）' })
  async update(
    @Param('id') id: string,
    @Body() body: { url?: string; events?: string[]; isActive?: boolean },
    @Request() req,
  ) {
    return this.webhookService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Webhookエンドポイント削除（MANAGER以上）' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.webhookService.delete(id, req.user.tenantId);
  }

  @Get(':id/deliveries')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Webhook配信履歴取得（MANAGER以上）' })
  async getDeliveries(@Param('id') id: string, @Request() req) {
    return this.webhookService.getDeliveries(id, req.user.tenantId);
  }
}
