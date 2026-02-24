import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { ApplicationStage } from "@prisma/client";

interface CandidateFilters {
  q?: string;
  stage?: ApplicationStage;
  tag?: string;
  jobId?: string;
}

interface CreateCandidateDto {
  name: string;
  email?: string;
  phone?: string;
  skills?: string[];
  tags?: string[];
  notes?: string;
}

interface UpdateCandidateDto {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  tags?: string[];
  notes?: string;
  score?: number;
  resumeUrl?: string;
}

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(
    tenantId: string,
    filters: CandidateFilters = {},
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: "insensitive" } },
        { email: { contains: filters.q, mode: "insensitive" } },
        { notes: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    if (filters.tag) {
      where.tags = { has: filters.tag };
    }

    if (filters.stage || filters.jobId) {
      const applicationWhere: any = {};
      if (filters.stage) applicationWhere.stage = filters.stage;
      if (filters.jobId) applicationWhere.jobId = filters.jobId;
      where.applications = { some: applicationWhere };
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          applications: {
            include: { candidate: false },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, tenantId },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!candidate) throw new NotFoundException("Candidate not found");
    return candidate;
  }

  async create(tenantId: string, userId: string, dto: CreateCandidateDto) {
    const candidate = await this.prisma.candidate.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills ?? [],
        tags: dto.tags ?? [],
        notes: dto.notes,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: "create_candidate",
      resource: "candidate",
      resourceId: candidate.id,
      metadata: { name: dto.name, email: dto.email },
    });

    return candidate;
  }

  async update(id: string, tenantId: string, dto: UpdateCandidateDto) {
    await this.findOne(id, tenantId);
    return this.prisma.candidate.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.candidate.delete({ where: { id } });
  }

  async getApplications(candidateId: string, tenantId: string) {
    await this.findOne(candidateId, tenantId);
    return this.prisma.candidateApplication.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async linkToJob(tenantId: string, candidateId: string, jobId: string) {
    await this.findOne(candidateId, tenantId);

    // jobがテナントに属しているか確認
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException("Job not found");

    return this.prisma.candidateApplication.create({
      data: {
        candidateId,
        jobId,
        stage: "SCREENING",
      },
    });
  }

  async updateStage(
    tenantId: string,
    applicationId: string,
    stage: ApplicationStage,
  ) {
    // アプリケーションがテナントのものか確認
    const application = await this.prisma.candidateApplication.findFirst({
      where: {
        id: applicationId,
        candidate: { tenantId },
      },
    });
    if (!application) throw new NotFoundException("Application not found");

    return this.prisma.candidateApplication.update({
      where: { id: applicationId },
      data: { stage },
    });
  }
}
