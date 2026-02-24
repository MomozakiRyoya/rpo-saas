import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { ResumeService } from "./resume.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("resumes")
@Controller("api/resumes")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Get()
  @Roles("MEMBER")
  @ApiOperation({ summary: "職務経歴書一覧" })
  @ApiQuery({ name: "candidateId", required: true })
  async findAll(@Query("candidateId") candidateId: string, @Request() req) {
    return this.resumeService.findAll(candidateId, req.user.tenantId);
  }

  @Post("generate")
  @Roles("MEMBER")
  @ApiOperation({ summary: "AI職務経歴書生成" })
  async generate(@Body() body: { candidateId: string }, @Request() req) {
    return this.resumeService.generate(body.candidateId, req.user.tenantId);
  }

  @Patch(":id")
  @Roles("MEMBER")
  @ApiOperation({ summary: "職務経歴書更新" })
  async update(
    @Param("id") id: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.resumeService.update(id, body.content, req.user.tenantId);
  }
}
