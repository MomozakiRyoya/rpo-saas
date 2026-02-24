import { Module } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { WebhookController } from "./webhook.controller";
import { WebhookInboundService } from "./webhook-inbound.service";
import { WebhookInboundController } from "./webhook-inbound.controller";

@Module({
  controllers: [WebhookController, WebhookInboundController],
  providers: [WebhookService, WebhookInboundService],
  exports: [WebhookService],
})
export class WebhookModule {}
