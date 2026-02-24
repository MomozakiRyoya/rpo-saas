import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { InviteUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, requestingUserRole: string) {
    if (requestingUserRole === 'ADMIN') {
      // ADMIN は全ユーザーを取得可能
      return this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // MANAGER/MEMBER は自テナントのみ
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string, requestingUserRole: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    // ADMIN以外は自テナントのみ参照可能
    if (requestingUserRole !== 'ADMIN' && user.tenantId !== tenantId) {
      throw new ForbiddenException('このユーザーへのアクセス権限がありません');
    }

    return user;
  }

  async invite(
    tenantId: string,
    inviterRole: string,
    dto: InviteUserDto,
  ) {
    // MANAGER は MEMBER のみ招待可能
    if (inviterRole === 'MANAGER' && dto.role === 'MANAGER') {
      throw new ForbiddenException(
        'MANAGERはMANAGERを招待できません。MEMBERのみ招待可能です。',
      );
    }

    // 既存メールチェック
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException(
        `メールアドレス ${dto.email} はすでに登録されています`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: dto.role,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    // メール未設定環境向けにコンソールへ出力
    console.log(
      `[UserService] ユーザー招待完了: ${newUser.email} (role: ${newUser.role}) ` +
        `初期パスワードは安全な方法で通知してください。`,
    );

    return newUser;
  }

  async updateRole(
    id: string,
    tenantId: string,
    requestingUserId: string,
    requestingUserRole: string,
    newRole: string,
  ) {
    // 自分自身のロール変更は不可
    if (id === requestingUserId) {
      throw new ForbiddenException('自分自身のロールを変更することはできません');
    }

    const target = await this.prisma.user.findUnique({ where: { id } });

    if (!target) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    // ADMIN以外は自テナントのみ操作可能
    if (requestingUserRole !== 'ADMIN' && target.tenantId !== tenantId) {
      throw new ForbiddenException('このユーザーへのアクセス権限がありません');
    }

    // MANAGER は MEMBER ロールへの変更のみ可能
    if (requestingUserRole === 'MANAGER' && newRole !== 'MEMBER') {
      throw new ForbiddenException(
        'MANAGERはMEMBERへのロール変更のみ実行できます',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: newRole as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        updatedAt: true,
      },
    });
  }

  async delete(
    id: string,
    tenantId: string,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    // 自分自身は削除不可
    if (id === requestingUserId) {
      throw new ForbiddenException('自分自身を削除することはできません');
    }

    const target = await this.prisma.user.findUnique({ where: { id } });

    if (!target) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    // ADMIN以外は自テナントのみ操作可能
    if (requestingUserRole !== 'ADMIN' && target.tenantId !== tenantId) {
      throw new ForbiddenException('このユーザーへのアクセス権限がありません');
    }

    // MANAGER は MEMBER のみ削除可能
    if (requestingUserRole === 'MANAGER' && target.role !== 'MEMBER') {
      throw new ForbiddenException('MANAGERはMEMBERのみ削除できます');
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
