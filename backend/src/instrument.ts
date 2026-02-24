import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// SENTRY_DSN が設定されている場合のみ初期化
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 1.0,
  });
  console.log('✅ Sentry initialized');
} else {
  console.log('ℹ️ SENTRY_DSN not set, Sentry disabled');
}
