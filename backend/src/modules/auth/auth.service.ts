import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  // パスワードリセットトークンをメモリに保持 (token -> { userId, expiresAt })
  private resetTokens = new Map<
    string,
    { userId: string; expiresAt: number }
  >();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      customerId: user.customerId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        customerId: user.customerId,
      },
      _codeVersion: "2026-02-16-17:30-BULLMQ-ENABLED",
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // テナントが存在しない場合は作成
    let tenant = await this.prisma.tenant.findUnique({
      where: { slug: registerDto.tenantSlug },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: registerDto.tenantName || registerDto.tenantSlug,
          slug: registerDto.tenantSlug,
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: registerDto.role || "MEMBER",
        tenantId: tenant.id,
        customerId: registerDto.customerId || null,
      },
      include: { tenant: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      customerId: user.customerId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        customerId: user.customerId,
      },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // セキュリティのため、ユーザーが存在しない場合も成功扱い
    if (!user) return;

    // 期限切れトークンを削除してから新規発行
    const now = Date.now();
    for (const [token, data] of this.resetTokens.entries()) {
      if (data.expiresAt <= now) this.resetTokens.delete(token);
    }

    const token = crypto.randomBytes(32).toString("hex");
    this.resetTokens.set(token, {
      userId: user.id,
      expiresAt: now + 60 * 60 * 1000, // 1時間
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordReset({
      to: email,
      userName: user.name,
      resetUrl,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = this.resetTokens.get(token);

    if (!record || record.expiresAt <= Date.now()) {
      throw new BadRequestException(
        "無効または期限切れのリセットリンクです。再度お試しください。",
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    });

    this.resetTokens.delete(token);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      customerId: user.customerId,
    };
  }
}
