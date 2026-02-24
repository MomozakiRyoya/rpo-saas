import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/auth.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "ログイン" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register")
  @ApiOperation({ summary: "ユーザー登録" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "現在のユーザー情報取得" })
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "パスワードリセットメール送信" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      message: "リセットメールを送信しました（メールアドレスが登録済みの場合）",
    };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "パスワードリセット実行" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: "パスワードをリセットしました" };
  }
}
