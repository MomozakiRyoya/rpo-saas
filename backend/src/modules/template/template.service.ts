import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

interface CreateTemplateDto {
  name: string;
  category?: string;
  title?: string;
  jobDescription?: string;
  promptTemplate?: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  requirements?: string;
}

interface UpdateTemplateDto {
  name?: string;
  category?: string;
  title?: string;
  jobDescription?: string;
  promptTemplate?: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  requirements?: string;
}

@Injectable()
export class TemplateService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(tenantId: string, filters: { category?: string } = {}) {
    const where: any = { tenantId };
    if (filters.category) {
      where.category = filters.category;
    }
    return this.prisma.jobTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const template = await this.prisma.jobTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(tenantId: string, userId: string, dto: CreateTemplateDto) {
    const template = await this.prisma.jobTemplate.create({
      data: { tenantId, ...dto },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'create_template',
      resource: 'jobTemplate',
      resourceId: template.id,
      metadata: { name: dto.name, category: dto.category },
    });

    return template;
  }

  async update(id: string, tenantId: string, dto: UpdateTemplateDto) {
    await this.findOne(id, tenantId);
    return this.prisma.jobTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.jobTemplate.delete({ where: { id } });
  }

  async applyToJob(templateId: string, jobId: string, tenantId: string) {
    const template = await this.findOne(templateId, tenantId);

    // 求人がテナントに属しているか確認
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    // テンプレートのフィールドを求人に適用（nullでないフィールドのみ）
    const updateData: any = {};
    if (template.title) updateData.title = template.title;
    if (template.jobDescription) updateData.description = template.jobDescription;
    if (template.location) updateData.location = template.location;
    if (template.salary) updateData.salaryRange = template.salary;
    if (template.employmentType) updateData.employmentType = template.employmentType;
    if (template.requirements) updateData.requirements = template.requirements;
    if (template.promptTemplate) updateData.promptTemplate = template.promptTemplate;

    return this.prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });
  }
}
