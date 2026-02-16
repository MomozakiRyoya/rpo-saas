import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { ConnectorFactory } from './connectors/connector.factory';

@Injectable()
export class ConnectorService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  // コネクタ一覧（管理画面用：全て表示）
  async findAll() {
    const connectors = await this.prisma.connector.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: connectors };
  }

  // コネクタ取得
  async findOne(id: string) {
    return this.prisma.connector.findUnique({
      where: { id },
    });
  }

  // コネクタ作成
  async create(data: { name: string; type: string; config: any }) {
    return this.prisma.connector.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        isActive: true,
      },
    });
  }

  // コネクタ更新
  async update(
    id: string,
    data: { name?: string; isActive?: boolean; config?: any },
  ) {
    return this.prisma.connector.update({
      where: { id },
      data,
    });
  }

  // コネクタ削除（論理削除）
  async delete(id: string) {
    return this.prisma.connector.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // コネクタ接続テスト
  async testConnection(id: string) {
    const connector = await this.prisma.connector.findUnique({
      where: { id },
    });

    if (!connector) {
      throw new Error('Connector not found');
    }

    try {
      const connectorInstance = ConnectorFactory.create(
        connector.type,
        connector.config as Record<string, any>,
      );

      const result = await connectorInstance.testConnection();

      return {
        success: result,
        message: result ? '接続成功' : '接続失敗',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 掲載作成・実行（BullMQ使用）
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
        status: 'PENDING',
      },
    });

    // BullMQジョブキューに追加
    const queueJob = await this.queueService.addPublicationJob({
      publicationId: publication.id,
      jobId,
      connectorId,
      tenantId,
    });

    return {
      publicationId: publication.id,
      status: 'PENDING',
      queueJobId: queueJob.jobId,
      queueName: queueJob.queueName,
    };
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
