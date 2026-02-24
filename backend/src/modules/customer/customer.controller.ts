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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/customer.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("customers")
@Controller("api/customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @Roles('MANAGER')
  @ApiOperation({ summary: "顧客一覧取得" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(
    @Request() req,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.customerService.findAll(
      req.user.tenantId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(":id")
  @Roles('MANAGER')
  @ApiOperation({ summary: "顧客詳細取得" })
  async findOne(@Param("id") id: string, @Request() req) {
    return this.customerService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('MANAGER')
  @ApiOperation({ summary: "顧客作成" })
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    return this.customerService.create(req.user.tenantId, createCustomerDto);
  }

  @Patch(":id")
  @Roles('MANAGER')
  @ApiOperation({ summary: "顧客更新" })
  async update(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req,
  ) {
    return this.customerService.update(
      id,
      req.user.tenantId,
      updateCustomerDto,
    );
  }

  @Delete(":id")
  @Roles('MANAGER')
  @ApiOperation({ summary: "顧客削除" })
  async delete(@Param("id") id: string, @Request() req) {
    return this.customerService.delete(id, req.user.tenantId);
  }

  @Get(":id/portal-users")
  @Roles('MANAGER')
  @ApiOperation({ summary: "ポータルユーザー一覧取得" })
  async getPortalUsers(@Param("id") id: string, @Request() req) {
    return this.customerService.getPortalUsers(id, req.user.tenantId);
  }

  @Post(":id/portal-users")
  @Roles('MANAGER')
  @ApiOperation({ summary: "ポータルユーザー作成" })
  async createPortalUser(
    @Param("id") id: string,
    @Body() body: { email: string; name: string; password: string },
    @Request() req,
  ) {
    return this.customerService.createPortalUser(id, req.user.tenantId, body);
  }
}
