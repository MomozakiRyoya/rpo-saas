import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }
    return tenant;
  }

  async findOneForUser(id: string, tenantId: string, requestingUserRole: string) {
    const tenant = await this.findOne(id);

    // ADMIN以外は自テナントのみ参照可能
    if (requestingUserRole !== 'ADMIN' && tenant.id !== tenantId) {
      throw new ForbiddenException('このテナントへのアクセス権限がありません');
    }

    return tenant;
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.tenant.create({ data });
  }

  async update(id: string, data: { name?: string }) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async updateForUser(id: string, tenantId: string, requestingUserRole: string, data: { name?: string }) {
    // ADMIN以外は自テナントのみ更新可能
    if (requestingUserRole !== 'ADMIN' && id !== tenantId) {
      throw new ForbiddenException('このテナントへのアクセス権限がありません');
    }

    return this.update(id, data);
  }
}
