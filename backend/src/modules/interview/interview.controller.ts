import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { InterviewService } from "./interview.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("interviews")
@Controller("api/interviews")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  @Get()
  @ApiOperation({ summary: "面談ログ一覧" })
  @ApiQuery({ name: "candidateId", required: false })
  async findAll(
    @Request() req,
    @Query("candidateId") candidateId?: string,
  ) {
    return this.interviewService.findAll(req.user.tenantId, candidateId);
  }

  @Post()
  @ApiOperation({ summary: "面談ログ作成" })
  async create(@Body() body: any, @Request() req) {
    return this.interviewService.create(body, req.user.tenantId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "面談ログ更新" })
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Request() req,
  ) {
    return this.interviewService.update(id, body, req.user.tenantId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "面談ログ削除" })
  async delete(@Param("id") id: string, @Request() req) {
    return this.interviewService.delete(id, req.user.tenantId);
  }
}
