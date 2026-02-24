import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LlmService } from "../llm/llm.service";

export interface MatchResult {
  candidate: {
    id: string;
    name: string;
    email: string | null;
    skills: string[];
    tags: string[];
    notes: string | null;
    score: number | null;
  };
  matchScore: number;
  reasons: string[];
}

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async matchCandidates(
    jobId: string,
    tenantId: string,
  ): Promise<MatchResult[]> {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
    });
    if (!job) throw new NotFoundException("Job not found");

    // Get all candidates in the tenant
    const candidates = await this.prisma.candidate.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        tags: true,
        notes: true,
        score: true,
      },
    });

    if (candidates.length === 0) {
      return [];
    }

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

    let results: MatchResult[];

    if (hasOpenAI) {
      results = await this.matchWithAI(job, candidates);
    } else {
      results = this.matchWithMock(candidates);
    }

    // Sort by matchScore descending and return top 10
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  private async matchWithAI(
    job: {
      title: string;
      description: string | null;
      requirements: string | null;
    },
    candidates: Array<{
      id: string;
      name: string;
      email: string | null;
      skills: string[];
      tags: string[];
      notes: string | null;
      score: number | null;
    }>,
  ): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const candidate of candidates) {
      try {
        const prompt = `以下の求人と候補者のプロフィールを評価し、マッチスコア（0-100）と理由を提供してください。

求人情報:
- タイトル: ${job.title}
- 概要: ${job.description ?? "未設定"}
- 要件: ${job.requirements ?? "未設定"}

候補者プロフィール:
- 名前: ${candidate.name}
- スキル: ${candidate.skills.join(", ") || "未設定"}
- タグ: ${candidate.tags.join(", ") || "未設定"}
- メモ: ${candidate.notes ?? "未設定"}

以下のJSON形式で回答してください（他のテキストは含めないこと）:
{
  "score": <0-100の整数>,
  "reasons": ["理由1", "理由2", "理由3"]
}`;

        const response = await this.llmService.generateText(prompt);

        // JSON部分を抽出してパース
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results.push({
            candidate,
            matchScore: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
            reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
          });
        } else {
          // パース失敗時はランダムスコア
          results.push({
            candidate,
            matchScore: Math.floor(Math.random() * 46) + 50,
            reasons: ["AI評価を取得できませんでした"],
          });
        }
      } catch {
        // エラー時はモックスコアにフォールバック
        results.push({
          candidate,
          matchScore: Math.floor(Math.random() * 46) + 50,
          reasons: ["AI評価中にエラーが発生しました"],
        });
      }
    }

    return results;
  }

  private matchWithMock(
    candidates: Array<{
      id: string;
      name: string;
      email: string | null;
      skills: string[];
      tags: string[];
      notes: string | null;
      score: number | null;
    }>,
  ): MatchResult[] {
    return candidates.map((candidate) => ({
      candidate,
      matchScore: Math.floor(Math.random() * 46) + 50, // 50-95のランダムスコア
      reasons: [
        "スキルセットが要件に近いと判断されました（モック）",
        "過去の実績から適性が高い可能性があります（モック）",
        "OPENAI_API_KEY が未設定のためモックスコアを表示しています",
      ],
    }));
  }
}
