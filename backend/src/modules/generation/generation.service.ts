import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GenerationService {
  constructor(private prisma: PrismaService) {}

  async generateText(jobId: string, tenantId: string, prompt?: string) {
    // テナントスコープチェック
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // 最新バージョン番号を取得
    const latestVersion = await this.prisma.jobTextVersion.findFirst({
      where: { jobId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // TODO: 実際のLLM呼び出し（モック）
    const generatedContent = `【モック生成テキスト】
職種: ${job.title}
場所: ${job.location || '未設定'}
給与: ${job.salary || '未設定'}
雇用形態: ${job.employmentType || '未設定'}

${job.description || ''}

応募要件:
${job.requirements || '未設定'}

※このテキストはモックで生成されています。実際のLLM統合時に差し替えてください。
カスタムプロンプト: ${prompt || 'なし'}
`;

    // バージョン保存
    const textVersion = await this.prisma.jobTextVersion.create({
      data: {
        jobId,
        version: newVersion,
        content: generatedContent,
        generatedBy: 'ai',
      },
    });

    // 求人ステータス更新
    if (job.status === 'DRAFT') {
      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'GENERATED' },
      });
    }

    return {
      versionId: textVersion.id,
      version: textVersion.version,
      content: textVersion.content,
    };
  }

  async generateImage(jobId: string, tenantId: string, prompt?: string) {
    // テナントスコープチェック
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        customer: { tenantId },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // 最新バージョン番号を取得
    const latestVersion = await this.prisma.jobImageVersion.findFirst({
      where: { jobId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // TODO: 実際の画像生成（モック）
    const dummyImageUrl = `https://via.placeholder.com/800x600.png?text=Job+Image+v${newVersion}`;

    // バージョン保存
    const imageVersion = await this.prisma.jobImageVersion.create({
      data: {
        jobId,
        version: newVersion,
        imageUrl: dummyImageUrl,
        prompt: prompt || `${job.title}の求人画像`,
        generatedBy: 'ai',
      },
    });

    // 求人ステータス更新
    if (job.status === 'DRAFT') {
      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: 'GENERATED' },
      });
    }

    return {
      versionId: imageVersion.id,
      version: imageVersion.version,
      imageUrl: imageVersion.imageUrl,
    };
  }
}
