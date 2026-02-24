import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CommentService } from "./comment.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("job-comments")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get("api/jobs/:jobId/comments")
  @ApiOperation({ summary: "ジョブコメント一覧取得" })
  async getComments(@Param("jobId") jobId: string, @Request() req) {
    return this.commentService.getComments(jobId, req.user.tenantId);
  }

  @Post("api/jobs/:jobId/comments")
  @ApiOperation({ summary: "コメント追加" })
  async addComment(
    @Param("jobId") jobId: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.commentService.addComment(
      jobId,
      req.user.tenantId,
      req.user.userId,
      body.content,
    );
  }

  @Delete("api/jobs/:jobId/comments/:id")
  @ApiOperation({ summary: "コメント削除" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param("jobId") jobId: string,
    @Param("id") id: string,
    @Request() req,
  ) {
    await this.commentService.deleteComment(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get("api/jobs/:jobId/assignments")
  @ApiOperation({ summary: "ジョブアサイン一覧取得" })
  async getAssignments(@Param("jobId") jobId: string, @Request() req) {
    return this.commentService.getAssignments(jobId, req.user.tenantId);
  }

  @Post("api/jobs/:jobId/assignments")
  @ApiOperation({ summary: "アサイン追加" })
  async addAssignment(
    @Param("jobId") jobId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    return this.commentService.addAssignment(
      jobId,
      req.user.tenantId,
      body.userId,
    );
  }

  @Delete("api/jobs/:jobId/assignments/:userId")
  @ApiOperation({ summary: "アサイン削除" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAssignment(
    @Param("jobId") jobId: string,
    @Param("userId") userId: string,
    @Request() req,
  ) {
    await this.commentService.removeAssignment(
      jobId,
      req.user.tenantId,
      userId,
    );
  }
}
