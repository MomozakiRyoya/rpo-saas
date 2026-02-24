import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { WebhookInboundService } from "./webhook-inbound.service";

@ApiTags("webhook-inbound")
@Controller("api/webhook-inbound")
export class WebhookInboundController {
  constructor(private webhookInboundService: WebhookInboundService) {}

  @Post("indeed")
  @HttpCode(200)
  @ApiOperation({ summary: "Indeed Webhook受信" })
  async indeedWebhook(@Body() payload: any) {
    return this.webhookInboundService.receiveInquiry("indeed", payload);
  }

  @Post("kyujin-box")
  @HttpCode(200)
  @ApiOperation({ summary: "求人ボックス Webhook受信" })
  async kyujinBoxWebhook(@Body() payload: any) {
    return this.webhookInboundService.receiveInquiry("kyujin-box", payload);
  }

  @Post("dummy")
  @HttpCode(200)
  @ApiOperation({ summary: "ダミー媒体 Webhook受信（テスト用）" })
  async dummyWebhook(@Body() payload: any) {
    return this.webhookInboundService.receiveInquiry("dummy", payload);
  }
}
