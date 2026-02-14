import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InquiryService } from './inquiry.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('inquiries')
@Controller('api/inquiries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InquiryController {
  constructor(private inquiryService: InquiryService) {}

  @Get()
  @ApiOperation({ summary: '問い合わせ一覧取得' })
  async findAll(@Request() req) {
    return this.inquiryService.findAll(req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: '問い合わせ登録' })
  async create(@Body() data: any, @Request() req) {
    return this.inquiryService.create(data, req.user.tenantId);
  }

  @Post(':id/generate-response')
  @ApiOperation({ summary: '返信案生成' })
  async generateResponse(@Param('id') id: string, @Request() req) {
    return this.inquiryService.generateResponse(id, req.user.tenantId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: '返信送信' })
  async sendResponse(
    @Param('id') id: string,
    @Body() body: { responseId: string },
    @Request() req,
  ) {
    return this.inquiryService.sendResponse(id, body.responseId, req.user.tenantId);
  }
}
