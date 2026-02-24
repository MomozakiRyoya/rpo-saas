import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateScoreCardDto {
  name: string;
  jobId?: string;
  criteria: Array<{
    name: string;
    weight: number;
    maxScore: number;
    order: number;
  }>;
}

interface UpdateScoreCardDto {
  name?: string;
  jobId?: string;
  criteria?: Array<{
    id?: string;
    name: string;
    weight: number;
    maxScore: number;
    order: number;
  }>;
}

@Injectable()
export class ScoreCardService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.scoreCard.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const scoreCard = await this.prisma.scoreCard.findFirst({
      where: { id, tenantId },
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    if (!scoreCard) throw new NotFoundException('ScoreCard not found');
    return scoreCard;
  }

  async create(tenantId: string, dto: CreateScoreCardDto) {
    return this.prisma.scoreCard.create({
      data: {
        tenantId,
        name: dto.name,
        jobId: dto.jobId ?? null,
        criteria: {
          create: dto.criteria.map((c) => ({
            name: c.name,
            weight: c.weight,
            maxScore: c.maxScore,
            order: c.order,
          })),
        },
      },
      include: {
        criteria: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateScoreCardDto) {
    await this.findOne(id, tenantId);

    // Update scorecard base fields
    const updated = await this.prisma.scoreCard.update({
      where: { id },
      data: {
        name: dto.name,
        jobId: dto.jobId,
      },
    });

    // Replace criteria if provided
    if (dto.criteria !== undefined) {
      await this.prisma.scoreCardCriteria.deleteMany({
        where: { scoreCardId: id },
      });
      await this.prisma.scoreCardCriteria.createMany({
        data: dto.criteria.map((c) => ({
          scoreCardId: id,
          name: c.name,
          weight: c.weight,
          maxScore: c.maxScore,
          order: c.order,
        })),
      });
    }

    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.scoreCard.delete({ where: { id } });
  }

  async addScore(
    criteriaId: string,
    candidateId: string,
    evaluatorId: string,
    score: number,
    comment?: string,
  ) {
    // Verify criteria exists
    const criteria = await this.prisma.scoreCardCriteria.findUnique({
      where: { id: criteriaId },
    });
    if (!criteria) throw new NotFoundException('ScoreCardCriteria not found');

    // Upsert score (one evaluator per criteria per candidate)
    return this.prisma.interviewScore.upsert({
      where: {
        criteriaId_candidateId_evaluatorId: {
          criteriaId,
          candidateId,
          evaluatorId,
        },
      },
      update: { score, comment },
      create: { criteriaId, candidateId, evaluatorId, score, comment },
      include: {
        criteria: {
          include: { scoreCard: true },
        },
      },
    });
  }

  async getCandidateScores(candidateId: string, tenantId: string) {
    // Verify candidate belongs to tenant
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const scores = await this.prisma.interviewScore.findMany({
      where: { candidateId },
      include: {
        criteria: {
          include: {
            scoreCard: {
              select: { id: true, name: true },
            },
          },
        },
        evaluator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Aggregate scores by scorecard
    const scorecardMap = new Map<
      string,
      {
        scoreCard: { id: string; name: string };
        totalScore: number;
        maxPossibleScore: number;
        percentage: number;
        criteria: Array<{
          criteriaId: string;
          criteriaName: string;
          score: number;
          maxScore: number;
          weight: number;
          evaluator: { id: string; name: string; email: string };
          comment?: string;
        }>;
      }
    >();

    for (const score of scores) {
      const scId = score.criteria.scoreCard.id;
      if (!scorecardMap.has(scId)) {
        scorecardMap.set(scId, {
          scoreCard: score.criteria.scoreCard,
          totalScore: 0,
          maxPossibleScore: 0,
          percentage: 0,
          criteria: [],
        });
      }

      const entry = scorecardMap.get(scId)!;
      entry.totalScore += score.score * score.criteria.weight;
      entry.maxPossibleScore += score.criteria.maxScore * score.criteria.weight;
      entry.criteria.push({
        criteriaId: score.criteriaId,
        criteriaName: score.criteria.name,
        score: score.score,
        maxScore: score.criteria.maxScore,
        weight: score.criteria.weight,
        evaluator: score.evaluator,
        comment: score.comment ?? undefined,
      });
    }

    // Calculate percentages
    for (const entry of scorecardMap.values()) {
      if (entry.maxPossibleScore > 0) {
        entry.percentage = Math.round((entry.totalScore / entry.maxPossibleScore) * 100);
      }
    }

    return Array.from(scorecardMap.values());
  }
}
