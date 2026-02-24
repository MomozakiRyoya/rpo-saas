import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ScoreCardService } from "./scorecard.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("scorecards")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScoreCardController {
  constructor(private scoreCardService: ScoreCardService) {}

  @Get("api/scorecards")
  @ApiOperation({ summary: "スコアカード一覧取得" })
  async findAll(@Request() req) {
    return this.scoreCardService.findAll(req.user.tenantId);
  }

  @Post("api/scorecards")
  @ApiOperation({ summary: "スコアカード作成" })
  async create(
    @Body() body: { name: string; jobId?: string; criteria: any[] },
    @Request() req,
  ) {
    return this.scoreCardService.create(req.user.tenantId, body);
  }

  @Get("api/scorecards/:id")
  @ApiOperation({ summary: "スコアカード詳細取得" })
  async findOne(@Param("id") id: string, @Request() req) {
    return this.scoreCardService.findOne(id, req.user.tenantId);
  }

  @Patch("api/scorecards/:id")
  @ApiOperation({ summary: "スコアカード更新" })
  async update(
    @Param("id") id: string,
    @Body() body: { name?: string; jobId?: string; criteria?: any[] },
    @Request() req,
  ) {
    return this.scoreCardService.update(id, req.user.tenantId, body);
  }

  @Delete("api/scorecards/:id")
  @ApiOperation({ summary: "スコアカード削除" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string, @Request() req) {
    await this.scoreCardService.delete(id, req.user.tenantId);
  }

  @Post("api/scorecards/:id/score")
  @ApiOperation({ summary: "スコア追加・更新" })
  async addScore(
    @Param("id") id: string,
    @Body()
    body: {
      criteriaId: string;
      candidateId: string;
      score: number;
      comment?: string;
    },
    @Request() req,
  ) {
    return this.scoreCardService.addScore(
      body.criteriaId,
      body.candidateId,
      req.user.userId,
      body.score,
      body.comment,
    );
  }

  @Get("api/candidates/:candidateId/scores")
  @ApiOperation({ summary: "候補者のスコア集計取得" })
  async getCandidateScores(
    @Param("candidateId") candidateId: string,
    @Request() req,
  ) {
    return this.scoreCardService.getCandidateScores(
      candidateId,
      req.user.tenantId,
    );
  }
}
