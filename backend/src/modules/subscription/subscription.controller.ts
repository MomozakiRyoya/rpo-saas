import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

// NOTE: Stripe webhookのraw bodyを受け取るには、main.tsで以下の設定が必要です:
// app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));
// NestJSではGlobalPipesとbodyParserの前にこのミドルウェアを設定してください。

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('api/subscription/plans')
  @ApiOperation({ summary: 'サブスクリプションプラン一覧（認証不要）' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('api/subscription/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '現在のプラン取得' })
  async getCurrentPlan(@Request() req) {
    return this.subscriptionService.getCurrentPlan(req.user.tenantId);
  }

  @Post('api/subscription/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stripe チェックアウトセッション作成' })
  async createCheckoutSession(
    @Body() body: { planId: string; successUrl: string; cancelUrl: string },
    @Request() req,
  ) {
    return this.subscriptionService.createCheckoutSession(
      req.user.tenantId,
      body.planId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('api/subscription/portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stripe カスタマーポータルセッション作成' })
  async createPortalSession(@Body() body: { returnUrl: string }, @Request() req) {
    return this.subscriptionService.createPortalSession(req.user.tenantId, body.returnUrl);
  }

  @Post('api/subscription/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhook受信（認証不要）' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<ExpressRequest>,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    await this.subscriptionService.handleStripeWebhook(rawBody, signature);
    return { received: true };
  }
}
