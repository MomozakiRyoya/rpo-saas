import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async getComments(jobId: string, tenantId: string) {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    return this.prisma.jobComment.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async addComment(jobId: string, tenantId: string, userId: string, content: string) {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    return this.prisma.jobComment.create({
      data: {
        jobId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteComment(commentId: string, tenantId: string, userId: string) {
    const comment = await this.prisma.jobComment.findFirst({
      where: { id: commentId },
      include: { job: { include: { customer: true } } },
    });

    if (!comment || comment.job.customer.tenantId !== tenantId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Only the comment owner can delete this comment');
    }

    await this.prisma.jobComment.delete({ where: { id: commentId } });
  }

  async getAssignments(jobId: string, tenantId: string) {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    return this.prisma.jobAssignment.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async addAssignment(jobId: string, tenantId: string, userId: string) {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    // Verify the user belongs to the tenant
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) throw new NotFoundException('User not found in this tenant');

    return this.prisma.jobAssignment.upsert({
      where: { jobId_userId: { jobId, userId } },
      update: {},
      create: { jobId, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async removeAssignment(jobId: string, tenantId: string, userId: string) {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException('Job not found');

    const assignment = await this.prisma.jobAssignment.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.prisma.jobAssignment.delete({
      where: { jobId_userId: { jobId, userId } },
    });
  }
}
