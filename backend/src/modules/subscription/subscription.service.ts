import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

// Stripe クライアントの初期化（APIキー未設定時はモード）
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
  : null;

// デフォルトプランデータ（DBが空の場合にシードとして使用）
const DEFAULT_PLANS = [
  {
    id: 'plan_free',
    name: 'Free',
    stripePriceId: null,
    price: 0,
    features: { maxJobs: 3, maxUsers: 1, aiGenerations: 5 },
    isActive: true,
  },
  {
    id: 'plan_starter',
    name: 'Starter',
    stripePriceId: null,
    price: 4980,
    features: { maxJobs: 10, maxUsers: 3, aiGenerations: 50 },
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    stripePriceId: null,
    price: 14800,
    features: { maxJobs: -1, maxUsers: 10, aiGenerations: -1 },
    isActive: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    stripePriceId: null,
    price: 49800,
    features: { maxJobs: -1, maxUsers: -1, aiGenerations: -1 },
    isActive: true,
  },
];

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    // DBが空の場合はデフォルトプランをシード
    if (plans.length === 0) {
      await this.prisma.subscriptionPlan.createMany({
        data: DEFAULT_PLANS.map((p) => ({
          id: p.id,
          name: p.name,
          stripePriceId: p.stripePriceId,
          price: p.price,
          features: p.features,
          isActive: p.isActive,
        })),
        skipDuplicates: true,
      });

      return this.prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
    }

    return plans;
  }

  async getCurrentPlan(tenantId: string) {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      // Freeプランとして返す
      const freePlan = await this.prisma.subscriptionPlan.findFirst({
        where: { name: 'Free' },
      });
      return { tenantId, plan: freePlan, status: 'FREE' };
    }

    return subscription;
  }

  async createOrUpdateSubscription(tenantId: string, planId: string) {
    // プランの存在確認
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('SubscriptionPlan not found');

    return this.prisma.tenantSubscription.upsert({
      where: { tenantId },
      update: {
        planId,
        status: 'ACTIVE',
      },
      create: {
        tenantId,
        planId,
        status: 'ACTIVE',
      },
      include: { plan: true },
    });
  }

  async createCheckoutSession(
    tenantId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('SubscriptionPlan not found');

    // Stripe未設定またはprice IDがない場合はモックURL
    if (!stripe || !plan.stripePriceId) {
      return {
        url: `${successUrl}?session_id=mock_session_${Date.now()}&plan=${planId}`,
      };
    }

    // テナントのStripe顧客IDを取得または作成
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      const customer = await stripe.customers.create({
        metadata: { tenantId },
        name: tenant?.name,
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { tenantId, planId },
    });

    return { url: session.url! };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!stripe) {
      console.warn('Stripe not configured, skipping webhook processing');
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { tenantId, planId } = session.metadata ?? {};
        if (tenantId && planId) {
          await this.prisma.tenantSubscription.upsert({
            where: { tenantId },
            update: {
              planId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'ACTIVE',
            },
            create: {
              tenantId,
              planId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'ACTIVE',
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await this.prisma.tenantSubscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existing) {
          await this.prisma.tenantSubscription.update({
            where: { id: existing.id },
            data: {
              status: sub.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
              currentPeriodStart: new Date((sub as any).current_period_start * 1000),
              currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await this.prisma.tenantSubscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existing) {
          await this.prisma.tenantSubscription.update({
            where: { id: existing.id },
            data: { status: 'CANCELED' },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  async createPortalSession(tenantId: string, returnUrl: string): Promise<{ url: string }> {
    if (!stripe) {
      return { url: returnUrl };
    }

    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
    });

    if (!subscription?.stripeCustomerId) {
      // カスタマーIDがない場合はモックURL
      return { url: returnUrl };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async checkLimit(tenantId: string, feature: string): Promise<boolean> {
    const subscriptionData = await this.getCurrentPlan(tenantId);
    const plan = subscriptionData.plan as any;

    if (!plan?.features) return false;

    const features = plan.features as Record<string, number>;
    const limit = features[feature];

    // -1 means unlimited
    if (limit === -1) return true;
    if (limit === undefined) return false;

    // Count current usage for the feature
    switch (feature) {
      case 'maxJobs': {
        const customers = await this.prisma.customer.findMany({
          where: { tenantId },
          select: { id: true },
        });
        const customerIds = customers.map((c) => c.id);
        const count = await this.prisma.job.count({
          where: { customerId: { in: customerIds }, status: { not: 'DRAFT' } },
        });
        return count < limit;
      }

      case 'maxUsers': {
        const count = await this.prisma.user.count({ where: { tenantId } });
        return count < limit;
      }

      case 'aiGenerations': {
        // aiGenerations は単純にプランに存在するか確認
        return limit > 0;
      }

      default:
        return limit > 0;
    }
  }
}
