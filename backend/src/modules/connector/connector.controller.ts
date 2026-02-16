import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectorService } from './connector.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/connector.dto';

@ApiTags('connectors')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConnectorController {
  constructor(private connectorService: ConnectorService) {}

  @Get('connectors')
  @ApiOperation({ summary: 'コネクタ一覧取得' })
  async findAll() {
    return this.connectorService.findAll();
  }

  @Get('connectors/:id')
  @ApiOperation({ summary: 'コネクタ取得' })
  async findOne(@Param('id') id: string) {
    return this.connectorService.findOne(id);
  }

  @Post('connectors')
  @ApiOperation({ summary: 'コネクタ作成' })
  async create(@Body() createConnectorDto: CreateConnectorDto) {
    return this.connectorService.create(createConnectorDto);
  }

  @Patch('connectors/:id')
  @ApiOperation({ summary: 'コネクタ更新' })
  async update(
    @Param('id') id: string,
    @Body() updateConnectorDto: UpdateConnectorDto,
  ) {
    return this.connectorService.update(id, updateConnectorDto);
  }

  @Put('connectors/:id')
  @ApiOperation({ summary: 'コネクタ更新（PUT）' })
  async updatePut(
    @Param('id') id: string,
    @Body() updateConnectorDto: UpdateConnectorDto,
  ) {
    return this.connectorService.update(id, updateConnectorDto);
  }

  @Delete('connectors/:id')
  @ApiOperation({ summary: 'コネクタ削除' })
  async delete(@Param('id') id: string) {
    return this.connectorService.delete(id);
  }

  @Post('connectors/:id/test')
  @ApiOperation({ summary: 'コネクタ接続テスト' })
  async testConnection(@Param('id') id: string) {
    return this.connectorService.testConnection(id);
  }

  @Post('publications')
  @ApiOperation({ summary: '掲載作成・実行' })
  async createPublication(
    @Body() body: { jobId: string; connectorId: string },
    @Request() req,
  ) {
    return this.connectorService.createPublication(body.jobId, body.connectorId, req.user.tenantId);
  }

  @Post('publications/:id/stop')
  @ApiOperation({ summary: '掲載停止' })
  async stopPublication(@Param('id') id: string, @Request() req) {
    return this.connectorService.stopPublication(id, req.user.tenantId);
  }
}
