import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { LlmModule } from '../llm/llm.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [LlmModule, QueueModule],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}
