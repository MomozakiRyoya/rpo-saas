import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { AuditModule } from '../audit/audit.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [AuditModule, WebhookModule],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
