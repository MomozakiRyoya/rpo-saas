import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LlmService } from "../llm/llm.service";

@Injectable()
export class ResumeService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async findAll(candidateId: string, tenantId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) throw new NotFoundException("Candidate not found");
    return this.prisma.resume.findMany({
      where: { candidateId },
      orderBy: { version: "desc" },
    });
  }

  async generate(candidateId: string, tenantId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
      include: {
        inquiries: {
          include: { job: { select: { title: true, description: true } } },
          take: 10,
        },
        interviews: {
          include: { job: { select: { title: true } } },
          orderBy: { scheduledAt: "desc" },
          take: 20,
        },
      },
    });
    if (!candidate) throw new NotFoundException("Candidate not found");

    const prompt = `
以下の候補者情報をもとに、日本語の職務経歴書を作成してください。

【候補者情報】
名前: ${candidate.name || "未設定"}
メール: ${candidate.email || "未設定"}

【問い合わせ・応募した求人】
${candidate.inquiries.map((i) => `- ${i.job?.title || "直接問い合わせ"}`).join("\n") || "なし"}

【面談履歴】
${
  candidate.interviews
    .map(
      (i) =>
        `- ${i.scheduledAt.toLocaleDateString("ja-JP")}: ${i.job?.title || "不明"} (${i.type}, 結果: ${i.result})`,
    )
    .join("\n") || "なし"
}

${candidate.notes ? `【備考】\n${candidate.notes}` : ""}

職務経歴書の形式で、以下のセクションを含めてください:
1. 基本情報
2. 職歴・応募状況
3. 面談履歴とフィードバック
4. 総合コメント（採用担当者向け）
`;

    let content: string;
    try {
      content = await this.llmService.generateText(prompt);
    } catch {
      content = `【職務経歴書】\n\n氏名: ${candidate.name || "未設定"}\nメール: ${candidate.email || "未設定"}\n\n応募求人数: ${candidate.inquiries.length}件\n面談回数: ${candidate.interviews.length}回\n\n※ AI生成に失敗しました。手動で内容を入力してください。`;
    }

    const lastResume = await this.prisma.resume.findFirst({
      where: { candidateId },
      orderBy: { version: "desc" },
    });

    return this.prisma.resume.create({
      data: {
        candidateId,
        tenantId,
        content,
        version: (lastResume?.version || 0) + 1,
      },
    });
  }

  async update(id: string, content: string, tenantId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, tenantId },
    });
    if (!resume) throw new NotFoundException("Resume not found");
    return this.prisma.resume.update({ where: { id }, data: { content } });
  }
}
