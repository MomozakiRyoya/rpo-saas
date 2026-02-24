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
  Res,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JobService } from "./job.service";
import { CreateJobDto, UpdateJobDto } from "./dto/job.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("jobs")
@Controller("api/jobs")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobController {
  constructor(private jobService: JobService) {}

  @Get()
  @ApiOperation({ summary: "求人一覧取得" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "customerId", required: false })
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(
    @Request() req,
    @Query("status") status?: string,
    @Query("customerId") customerId?: string,
    @Query("q") q?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.jobService.findAll(
      req.user.tenantId,
      { status, customerId, q },
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get("export")
  @ApiOperation({ summary: "求人CSVエクスポート" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "customerId", required: false })
  async exportCsv(
    @Request() req,
    @Res() res: Response,
    @Query("status") status?: string,
    @Query("customerId") customerId?: string,
  ) {
    const csv = await this.jobService.exportCsv(req.user.tenantId, {
      status,
      customerId,
    });
    const bom = "\uFEFF";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="jobs_${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(bom + csv);
  }

  @Get(":id")
  @ApiOperation({ summary: "求人詳細取得" })
  async findOne(@Param("id") id: string, @Request() req) {
    return this.jobService.findOne(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: "求人作成" })
  async create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobService.create(
      req.user.tenantId,
      req.user.userId,
      createJobDto,
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "求人更新" })
  async update(
    @Param("id") id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
  ) {
    return this.jobService.update(
      id,
      req.user.tenantId,
      req.user.userId,
      updateJobDto,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "求人削除" })
  async delete(@Param("id") id: string, @Request() req) {
    return this.jobService.delete(id, req.user.tenantId, req.user.userId);
  }

  @Post(":id/submit-for-approval")
  @ApiOperation({ summary: "承認申請" })
  async submitForApproval(@Param("id") id: string, @Request() req) {
    return this.jobService.submitForApproval(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get(":id/text-versions")
  @ApiOperation({ summary: "テキストバージョン履歴取得" })
  async getTextVersions(@Param("id") id: string, @Request() req) {
    return this.jobService.getTextVersions(id, req.user.tenantId);
  }

  @Get(":id/image-versions")
  @ApiOperation({ summary: "画像バージョン履歴取得" })
  async getImageVersions(@Param("id") id: string, @Request() req) {
    return this.jobService.getImageVersions(id, req.user.tenantId);
  }

  @Get(":id/diff/:v1/:v2")
  @ApiOperation({ summary: "バージョン差分取得" })
  async getDiff(
    @Param("id") id: string,
    @Param("v1") v1: string,
    @Param("v2") v2: string,
    @Request() req,
  ) {
    return this.jobService.getDiff(
      id,
      req.user.tenantId,
      Number(v1),
      Number(v2),
    );
  }
}
