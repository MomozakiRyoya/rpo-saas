import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LlmModule } from '../llm/llm.module';
import { EmailModule } from '../email/email.module';
import { QueueService } from './queue.service';
import { QueueController, DiagnosticsController } from './queue.controller';
import { TextGenerationProcessor } from './processors/text-generation.processor';
import { ImageGenerationProcessor } from './processors/image-generation.processor';
import { PublicationProcessor } from './processors/publication.processor';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [PrismaModule, LlmModule, EmailModule],
  controllers: [QueueController, DiagnosticsController],
  providers: [
    QueueService,
    TextGenerationProcessor,
    ImageGenerationProcessor,
    PublicationProcessor,
    EmailProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
