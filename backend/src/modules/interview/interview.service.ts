import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class InterviewService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, candidateId?: string) {
    return this.prisma.interviewLog.findMany({
      where: {
        ...(candidateId ? { candidateId } : {}),
        candidate: { tenantId },
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
        interviewer: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
  }

  async create(
    data: {
      candidateId: string;
      jobId?: string;
      scheduledAt: string | Date;
      type: string;
      result?: string;
      notes?: string;
      interviewerId?: string;
    },
    tenantId: string,
  ) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: data.candidateId, tenantId },
    });
    if (!candidate) throw new NotFoundException("Candidate not found");

    return this.prisma.interviewLog.create({
      data: {
        candidateId: data.candidateId,
        jobId: data.jobId || null,
        scheduledAt: new Date(data.scheduledAt),
        type: data.type,
        result: data.result || "pending",
        notes: data.notes || null,
        interviewerId: data.interviewerId || null,
      },
      include: {
        candidate: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
      },
    });
  }

  async update(
    id: string,
    data: { result?: string; notes?: string; scheduledAt?: string },
    tenantId: string,
  ) {
    const interview = await this.prisma.interviewLog.findFirst({
      where: { id, candidate: { tenantId } },
    });
    if (!interview) throw new NotFoundException("Interview not found");

    return this.prisma.interviewLog.update({
      where: { id },
      data: {
        ...(data.result ? { result: data.result } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const interview = await this.prisma.interviewLog.findFirst({
      where: { id, candidate: { tenantId } },
    });
    if (!interview) throw new NotFoundException("Interview not found");
    await this.prisma.interviewLog.delete({ where: { id } });
  }
}
