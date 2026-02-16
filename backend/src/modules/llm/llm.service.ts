import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private anthropicClient: Anthropic;
  private geminiClient: GoogleGenerativeAI;

  constructor() {
    try {
      console.log('🔧 Initializing LlmService...');

      // Anthropic (Claude) の初期化
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        console.warn(
          '⚠️ ANTHROPIC_API_KEY is not set. Text generation will use mock responses.',
        );
      }
      this.anthropicClient = new Anthropic({
        apiKey: anthropicApiKey || 'dummy-key',
      });

      // Google Gemini の初期化
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn(
          '⚠️ GEMINI_API_KEY is not set. Image generation will use mock responses.',
        );
      }
      this.geminiClient = new GoogleGenerativeAI(geminiApiKey || 'dummy-key');

      console.log('✅ LlmService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize LlmService:', error);
      throw error;
    }
  }

  /**
   * 求人テキストを生成
   */
  async generateJobText(params: {
    title: string;
    location?: string;
    salary?: string;
    employmentType?: string;
    description?: string;
    requirements?: string;
    customPrompt?: string;
  }): Promise<string> {
    const {
      title,
      location,
      salary,
      employmentType,
      description,
      requirements,
      customPrompt,
    } = params;

    // API Keyが設定されていない場合はモック
    if (!process.env.ANTHROPIC_API_KEY) {
      return this.generateMockJobText(params);
    }

    const systemPrompt = `あなたは優秀な求人広告ライターです。提供された情報を元に、魅力的で分かりやすい求人テキストを作成してください。

求人テキストの要件:
- 読みやすい構成（見出し、箇条書きを活用）
- 応募者の興味を引く表現
- 具体的で明確な情報
- 応募したくなるような魅力的な文章
- 日本語で作成`;

    const userPrompt = `以下の情報を元に求人テキストを作成してください。

【求人情報】
職種: ${title}
勤務地: ${location || '未設定'}
給与: ${salary || '未設定'}
雇用形態: ${employmentType || '未設定'}

【仕事内容】
${description || '未設定'}

【応募要件】
${requirements || '未設定'}

${customPrompt ? `\n【追加指示】\n${customPrompt}` : ''}`;

    try {
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (textContent && 'text' in textContent) {
        return textContent.text;
      }

      throw new Error('No text content in response');
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to generate job text: ${error.message}`);
    }
  }

  /**
   * 問い合わせ返信案を生成
   */
  async generateInquiryResponse(params: {
    applicantName?: string;
    inquiryContent: string;
    jobTitle?: string;
  }): Promise<string> {
    const { applicantName, inquiryContent, jobTitle } = params;

    // API Keyが設定されていない場合はモック
    if (!process.env.ANTHROPIC_API_KEY) {
      return this.generateMockInquiryResponse(params);
    }

    const systemPrompt = `あなたは採用担当者として、求職者からの問い合わせに丁寧に対応します。

返信の要件:
- 丁寧で親切な対応
- 具体的で分かりやすい回答
- 前向きで好印象な文章
- ビジネスメールの形式
- 日本語で作成`;

    const userPrompt = `以下の問い合わせに対して、適切な返信案を作成してください。

【問い合わせ者】
${applicantName || '応募者'}様

${jobTitle ? `【応募求人】\n${jobTitle}\n` : ''}
【問い合わせ内容】
${inquiryContent}

適切な返信メールを作成してください。`;

    try {
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (textContent && 'text' in textContent) {
        return textContent.text;
      }

      throw new Error('No text content in response');
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to generate inquiry response: ${error.message}`);
    }
  }

  /**
   * モック: 求人テキスト生成
   */
  private generateMockJobText(params: {
    title: string;
    location?: string;
    salary?: string;
    employmentType?: string;
    description?: string;
    requirements?: string;
    customPrompt?: string;
  }): string {
    const {
      title,
      location,
      salary,
      employmentType,
      description,
      requirements,
      customPrompt,
    } = params;

    return `# ${title}

## 募集要項

**勤務地:** ${location || '未設定'}
**給与:** ${salary || '未設定'}
**雇用形態:** ${employmentType || '未設定'}

## 仕事内容

${description || '詳細は面談時にお伝えいたします。'}

## 応募要件

${requirements || '特になし'}

---

※このテキストはモックで生成されています（ANTHROPIC_API_KEYが未設定）。
※本番環境ではClaude APIを使用して魅力的な求人テキストが生成されます。

${customPrompt ? `\nカスタムプロンプト: ${customPrompt}` : ''}`;
  }

  /**
   * モック: 問い合わせ返信案生成
   */
  private generateMockInquiryResponse(params: {
    applicantName?: string;
    inquiryContent: string;
    jobTitle?: string;
  }): string {
    const { applicantName, inquiryContent, jobTitle } = params;

    return `${applicantName || '応募者'}様

お問い合わせありがとうございます。

${jobTitle ? `【${jobTitle}】へのご応募に関するお問い合わせですね。\n` : ''}
【お問い合わせ内容】
${inquiryContent}

【回答】
お問い合わせいただいた内容について、担当者より詳細をご案内させていただきます。
※このメッセージはモックで生成されています（ANTHROPIC_API_KEYが未設定）。
※本番環境ではClaude APIを使用して適切な返信が生成されます。

何かご不明点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。`;
  }

  /**
   * 画像を生成（Gemini API - Imagen 3）
   */
  async generateImage(params: {
    prompt: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    imageSize?: '1K' | '2K' | '4K';
  }): Promise<{ imageData: string; mimeType: string }> {
    const { prompt, aspectRatio = '1:1', imageSize = '1K' } = params;

    // API Keyが設定されていない場合はモック
    if (!process.env.GEMINI_API_KEY) {
      return this.generateMockImage(params);
    }

    try {
      // REST APIを直接呼び出す
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'image/png',
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // 画像データを探す
      for (const candidate of data.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData) {
            return {
              imageData: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/png',
            };
          }
        }
      }

      throw new Error('No image data in response');
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * モック: 画像生成
   */
  private generateMockImage(params: {
    prompt: string;
  }): { imageData: string; mimeType: string } {
    // 1x1 透明PNG画像のbase64データ（モック）
    const mockImageData =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    console.log(
      `🖼️ Mock image generation (GEMINI_API_KEY not set): ${params.prompt}`,
    );

    return {
      imageData: mockImageData,
      mimeType: 'image/png',
    };
  }
}
