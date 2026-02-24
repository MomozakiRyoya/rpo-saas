import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AuditModule, EmailModule],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
