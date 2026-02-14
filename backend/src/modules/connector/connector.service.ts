import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConnectorService {
  constructor(private prisma: PrismaService) {}

  // コネクタ一覧（ダミー媒体を含む）
  async findAll() {
    return this.prisma.connector.findMany({
      where: { isActive: true },
    });
  }

  // 掲載作成・実行（モック）
  async createPublication(jobId: string, connectorId: string, tenantId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        customer: { tenantId },
      },
    });

    if (!job) throw new Error('Job not found');

    const publication = await this.prisma.publication.create({
      data: {
        jobId,
        connectorId,
        status: 'PUBLISHING',
      },
    });

    // モック: 掲載実行（非同期ジョブとして本来は実装）
    setTimeout(async () => {
      await this.prisma.publication.update({
        where: { id: publication.id },
        data: {
          status: 'PUBLISHED',
          externalId: `MOCK-${Date.now()}`,
          publishedAt: new Date(),
        },
      });

      await this.prisma.publicationLog.create({
        data: {
          publicationId: publication.id,
          action: 'create',
          status: 'success',
          request: { jobId, connectorId },
          response: { externalId: `MOCK-${Date.now()}` },
        },
      });

      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'PUBLISHED' },
      });
    }, 2000);

    return { publicationId: publication.id, status: 'PUBLISHING' };
  }

  // 掲載停止（モック）
  async stopPublication(publicationId: string, tenantId: string) {
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: publicationId,
        job: {
          customer: { tenantId },
        },
      },
    });

    if (!publication) throw new Error('Publication not found');

    await this.prisma.publication.update({
      where: { id: publicationId },
      data: {
        status: 'STOPPED',
        stoppedAt: new Date(),
      },
    });

    await this.prisma.publicationLog.create({
      data: {
        publicationId,
        action: 'stop',
        status: 'success',
      },
    });

    return { message: 'Publication stopped successfully' };
  }
}
