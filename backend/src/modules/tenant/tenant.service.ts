import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { name?: string }) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
