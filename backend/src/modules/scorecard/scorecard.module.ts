import { Module } from '@nestjs/common';
import { ScoreCardService } from './scorecard.service';
import { ScoreCardController } from './scorecard.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScoreCardController],
  providers: [ScoreCardService],
  exports: [ScoreCardService],
})
export class ScoreCardModule {}
