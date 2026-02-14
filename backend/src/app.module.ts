import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CustomerModule } from './modules/customer/customer.module';
import { JobModule } from './modules/job/job.module';
import { GenerationModule } from './modules/generation/generation.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { ConnectorModule } from './modules/connector/connector.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    TenantModule,
    CustomerModule,
    JobModule,
    GenerationModule,
    ApprovalModule,
    ConnectorModule,
    InquiryModule,
    ScheduleModule,
    AnalyticsModule,
    AuditModule,
  ],
})
export class AppModule {}
