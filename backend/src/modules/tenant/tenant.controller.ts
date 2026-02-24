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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('tenants')
@Controller('api/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '全テナント一覧（ADMINのみ）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tenantService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'テナント作成（ADMINのみ）' })
  async create(@Body() body: { name: string; slug: string }) {
    return this.tenantService.create(body);
  }

  @Get(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'テナント情報取得（MANAGER以上）' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tenantService.findOneForUser(id, req.user.tenantId, req.user.role);
  }

  @Patch(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'テナント情報更新（MANAGER以上・自テナントのみ）' })
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string },
    @Request() req,
  ) {
    return this.tenantService.updateForUser(id, req.user.tenantId, req.user.role, data);
  }
}
