import { Module } from "@nestjs/common";
import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";
import { LlmModule } from "../llm/llm.module";

@Module({
  imports: [LlmModule],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
