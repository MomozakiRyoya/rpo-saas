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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InviteUserDto, UpdateRoleDto } from './dto/user.dto';

@ApiTags('users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles('MANAGER')
  @ApiOperation({ summary: 'ユーザー一覧取得（MANAGER以上）' })
  async findAll(@Request() req) {
    return this.userService.findAll(req.user.tenantId, req.user.role);
  }

  @Get(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'ユーザー詳細取得（MANAGER以上）' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.userService.findOne(id, req.user.tenantId, req.user.role);
  }

  @Post('invite')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'ユーザー招待（MANAGER以上）' })
  async invite(@Body() dto: InviteUserDto, @Request() req) {
    return this.userService.invite(req.user.tenantId, req.user.role, dto);
  }

  @Patch(':id/role')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'ロール変更（MANAGER以上）' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    return this.userService.updateRole(
      id,
      req.user.tenantId,
      req.user.userId,
      req.user.role,
      dto.role,
    );
  }

  @Delete(':id')
  @Roles('MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ユーザー削除（MANAGER以上）' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.userService.delete(
      id,
      req.user.tenantId,
      req.user.userId,
      req.user.role,
    );
  }
}
