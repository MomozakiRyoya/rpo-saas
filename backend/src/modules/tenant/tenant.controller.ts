import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('tenants')
@Controller('api/tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get(':id')
  @ApiOperation({ summary: 'テナント情報取得' })
  async findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'テナント情報更新' })
  async update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.tenantService.update(id, data);
  }
}
