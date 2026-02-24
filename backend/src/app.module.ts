import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { LlmModule } from "./modules/llm/llm.module";
import { EmailModule } from "./modules/email/email.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { JobModule } from "./modules/job/job.module";
import { GenerationModule } from "./modules/generation/generation.module";
import { ApprovalModule } from "./modules/approval/approval.module";
import { ConnectorModule } from "./modules/connector/connector.module";
import { InquiryModule } from "./modules/inquiry/inquiry.module";
import { ScheduleModule } from "./modules/schedule/schedule.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuditModule } from "./modules/audit/audit.module";
import { QueueModule } from "./modules/queue/queue.module";
import { PortalModule } from "./modules/portal/portal.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { WebhookModule } from "./modules/webhook/webhook.module";
import { CandidateModule } from "./modules/candidate/candidate.module";
import { InterviewModule } from "./modules/interview/interview.module";
import { ResumeModule } from "./modules/resume/resume.module";
import { TemplateModule } from "./modules/template/template.module";
import { CommentModule } from "./modules/comment/comment.module";
import { ScoreCardModule } from "./modules/scorecard/scorecard.module";
import { SubscriptionModule } from "./modules/subscription/subscription.module";
import { MatchingModule } from "./modules/matching/matching.module";
import { ReportModule } from "./modules/report/report.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // QueueModuleの依存モジュールを先に読み込む
    LlmModule,
    EmailModule,
    QueueModule,
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
    PortalModule,
    NotificationsModule,
    WebhookModule,
    CandidateModule,
    InterviewModule,
    ResumeModule,
    TemplateModule,
    CommentModule,
    ScoreCardModule,
    SubscriptionModule,
    MatchingModule,
    ReportModule,
  ],
})
export class AppModule {}
