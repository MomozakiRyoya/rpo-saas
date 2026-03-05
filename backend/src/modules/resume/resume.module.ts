import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";
import { LlmModule } from "../llm/llm.module";

@Module({
  imports: [LlmModule, MulterModule.register({ storage: memoryStorage() })],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
