import { Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AuditModule, EmailModule],
  controllers: [ApprovalController],
  providers: [ApprovalService],
})
export class ApprovalModule {}
