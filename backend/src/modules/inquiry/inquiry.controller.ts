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
import { InquiryService } from "./inquiry.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("inquiries")
@Controller("api/inquiries")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InquiryController {
  constructor(private inquiryService: InquiryService) {}

  @Get()
  @Roles('MEMBER')
  @ApiOperation({ summary: "問い合わせ一覧" })
  @ApiQuery({ name: "source", required: false })
  @ApiQuery({ name: "status", required: false })
  async findAll(
    @Request() req,
    @Query("source") source?: string,
    @Query("status") status?: string,
  ) {
    return this.inquiryService.findAll(req.user.tenantId, { source, status });
  }

  @Post()
  @Roles('MEMBER')
  @ApiOperation({ summary: "問い合わせ登録" })
  async create(@Body() body: any, @Request() req) {
    return this.inquiryService.create(body, req.user.tenantId);
  }

  @Post(":id/generate-response")
  @Roles('MEMBER')
  @ApiOperation({ summary: "返信案生成" })
  async generateResponse(@Param("id") id: string, @Request() req) {
    return this.inquiryService.generateResponse(id, req.user.tenantId);
  }

  @Post(":id/send")
  @Roles('MEMBER')
  @ApiOperation({ summary: "返信送信（メール or 媒体経由）" })
  async sendResponse(
    @Param("id") id: string,
    @Body() body: { responseId: string },
    @Request() req,
  ) {
    return this.inquiryService.sendResponse(
      id,
      body.responseId,
      req.user.tenantId,
    );
  }

  @Patch(":id/assign-candidate")
  @Roles('MEMBER')
  @ApiOperation({ summary: "候補者を紐付け" })
  async assignCandidate(
    @Param("id") id: string,
    @Body() body: { candidateId: string },
    @Request() req,
  ) {
    return this.inquiryService.assignCandidate(
      id,
      body.candidateId,
      req.user.tenantId,
    );
  }
}
