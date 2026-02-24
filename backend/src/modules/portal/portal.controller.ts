import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PortalService } from "./portal.service";

@ApiTags("portal")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/portal")
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  private requireCustomer(req: any): string {
    if (req.user.role !== "CUSTOMER") {
      throw new ForbiddenException("Customer portal access only");
    }
    if (!req.user.customerId) {
      throw new ForbiddenException("No customer linked to this user");
    }
    return req.user.customerId;
  }

  @Get("me")
  @ApiOperation({ summary: "ポータルユーザー情報取得" })
  async getMe(@Request() req: any) {
    if (req.user.role !== "CUSTOMER") {
      throw new ForbiddenException("Customer portal access only");
    }
    return this.portalService.getPortalUser(req.user.userId);
  }

  @Get("jobs")
  @ApiOperation({ summary: "自社求人一覧" })
  async getJobs(@Request() req: any, @Query("status") status?: string) {
    const customerId = this.requireCustomer(req);
    return this.portalService.getJobs(customerId, status);
  }

  @Get("jobs/:id")
  @ApiOperation({ summary: "求人詳細" })
  async getJob(@Request() req: any, @Param("id") id: string) {
    const customerId = this.requireCustomer(req);
    return this.portalService.getJobById(customerId, id);
  }

  @Get("approvals")
  @ApiOperation({ summary: "承認待ち一覧" })
  async getApprovals(@Request() req: any) {
    const customerId = this.requireCustomer(req);
    return this.portalService.getPendingApprovals(customerId);
  }

  @Post("approvals/:id/approve")
  @ApiOperation({ summary: "求人承認" })
  async approve(@Request() req: any, @Param("id") id: string) {
    const customerId = this.requireCustomer(req);
    return this.portalService.approveJob(customerId, id, req.user.userId);
  }

  @Post("approvals/:id/reject")
  @ApiOperation({ summary: "求人差し戻し" })
  async reject(
    @Request() req: any,
    @Param("id") id: string,
    @Body("comment") comment: string,
  ) {
    if (!comment) {
      throw new BadRequestException("差し戻し理由を入力してください");
    }
    const customerId = this.requireCustomer(req);
    return this.portalService.rejectJob(
      customerId,
      id,
      req.user.userId,
      comment,
    );
  }

  @Get("analytics")
  @ApiOperation({ summary: "アナリティクス" })
  async getAnalytics(@Request() req: any) {
    const customerId = this.requireCustomer(req);
    return this.portalService.getAnalytics(customerId);
  }
}
