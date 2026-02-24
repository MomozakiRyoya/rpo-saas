import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHmac, randomBytes } from 'crypto';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const endpoint = await this.prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
    });
    if (!endpoint) throw new NotFoundException('Webhook endpoint not found');
    return endpoint;
  }

  async create(tenantId: string, dto: { url: string; events: string[] }) {
    const secret = randomBytes(32).toString('hex');
    return this.prisma.webhookEndpoint.create({
      data: { tenantId, url: dto.url, events: dto.events, secret },
    });
  }

  async update(
    id: string,
    tenantId: string,
    dto: { url?: string; events?: string[]; isActive?: boolean },
  ) {
    await this.findOne(id, tenantId);
    return this.prisma.webhookEndpoint.update({ where: { id }, data: dto });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.webhookEndpoint.delete({ where: { id } });
  }

  async getDeliveries(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.webhookDelivery.findMany({
      where: { endpointId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async dispatch(tenantId: string, event: string, payload: object): Promise<void> {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { tenantId, isActive: true, events: { has: event } },
    });

    await Promise.allSettled(
      endpoints.map((ep) => this.deliverWebhook(ep, event, payload)),
    );
  }

  private async deliverWebhook(
    endpoint: { id: string; url: string; secret: string },
    event: string,
    payload: object,
  ): Promise<void> {
    const body = JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString(),
    });
    const signature = createHmac('sha256', endpoint.secret).update(body).digest('hex');
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let success = false;

    try {
      const url = new URL(endpoint.url);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'X-RPO-Signature': `sha256=${signature}`,
          'X-RPO-Event': event,
        },
      };

      const result = await new Promise<{ status: number; body: string }>(
        (resolve, reject) => {
          const transport = url.protocol === 'https:' ? https : http;
          const req = transport.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () =>
              resolve({ status: res.statusCode ?? 0, body: data }),
            );
          });
          req.on('error', reject);
          req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
          req.write(body);
          req.end();
        },
      );

      responseStatus = result.status;
      responseBody = result.body.substring(0, 1000);
      success = result.status >= 200 && result.status < 300;
    } catch (err) {
      responseBody = err instanceof Error ? err.message : 'Unknown error';
    }

    await this.prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event,
        payload: payload as any,
        responseStatus,
        responseBody,
        success,
      },
    });
  }
}
