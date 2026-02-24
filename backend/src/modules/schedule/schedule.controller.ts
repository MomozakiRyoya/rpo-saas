import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('schedules')
@Controller('api/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  @Roles('MEMBER')
  @ApiOperation({ summary: '日程調整一覧取得' })
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Post()
  @Roles('MEMBER')
  @ApiOperation({ summary: '日程調整作成' })
  async create(@Body() data: any) {
    return this.scheduleService.create(data);
  }

  @Post(':id/confirm')
  @Roles('MEMBER')
  @ApiOperation({ summary: '日程確定' })
  async confirm(@Param('id') id: string, @Body() body: { slotId: string }) {
    return this.scheduleService.confirm(id, body.slotId);
  }
}
