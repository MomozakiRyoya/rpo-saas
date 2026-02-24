import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("notifications")
@Controller("api/notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get("summary")
  @ApiOperation({ summary: "通知サマリー取得" })
  async getSummary(@Request() req) {
    return this.notificationsService.getSummary(req.user.tenantId);
  }
}
