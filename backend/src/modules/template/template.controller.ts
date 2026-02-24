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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('templates')
@Controller('api/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Get()
  @Roles('MEMBER')
  @ApiOperation({ summary: 'テンプレート一覧取得' })
  @ApiQuery({ name: 'category', required: false, type: String })
  async findAll(@Request() req, @Query('category') category?: string) {
    return this.templateService.findAll(req.user.tenantId, { category });
  }

  @Post()
  @Roles('MEMBER')
  @ApiOperation({ summary: 'テンプレート作成' })
  async create(
    @Body()
    body: {
      name: string;
      category?: string;
      title?: string;
      jobDescription?: string;
      promptTemplate?: string;
      location?: string;
      salary?: string;
      employmentType?: string;
      requirements?: string;
    },
    @Request() req,
  ) {
    return this.templateService.create(req.user.tenantId, req.user.id, body);
  }

  @Get(':id')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'テンプレート詳細取得' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.templateService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'テンプレート更新' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      category?: string;
      title?: string;
      jobDescription?: string;
      promptTemplate?: string;
      location?: string;
      salary?: string;
      employmentType?: string;
      requirements?: string;
    },
    @Request() req,
  ) {
    return this.templateService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'テンプレート削除' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.templateService.delete(id, req.user.tenantId);
  }

  @Post(':id/apply')
  @Roles('MEMBER')
  @ApiOperation({ summary: 'テンプレートを求人に適用' })
  async applyToJob(
    @Param('id') id: string,
    @Body() body: { jobId: string },
    @Request() req,
  ) {
    return this.templateService.applyToJob(id, body.jobId, req.user.tenantId);
  }
}
