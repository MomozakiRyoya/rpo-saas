import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class LlmService {
  private openaiClient: OpenAI;
  private geminiClient: GoogleGenerativeAI;

  constructor() {
    try {
      console.log("🔧 Initializing LlmService...");

      // OpenAI の初期化
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.warn(
          "⚠️ OPENAI_API_KEY is not set. Text generation will use mock responses.",
        );
      }
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey || "dummy-key",
      });

      // Google Gemini の初期化
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.warn(
          "⚠️ GEMINI_API_KEY is not set. Image generation will use mock responses.",
        );
      }
      this.geminiClient = new GoogleGenerativeAI(geminiApiKey || "dummy-key");

      console.log("✅ LlmService initialized");
    } catch (error) {
      console.error("❌ Failed to initialize LlmService:", error);
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
    if (!process.env.OPENAI_API_KEY) {
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
勤務地: ${location || "未設定"}
給与: ${salary || "未設定"}
雇用形態: ${employmentType || "未設定"}

【仕事内容】
${description || "未設定"}

【応募要件】
${requirements || "未設定"}

${customPrompt ? `\n【追加指示】\n${customPrompt}` : ""}`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return content;
      }

      throw new Error("No text content in response");
    } catch (error) {
      console.error("OpenAI API error:", error);
      console.warn("⚠️ Falling back to mock text generation");
      return this.generateMockJobText(params);
    }
  }

  /**
   * 汎用テキスト生成
   */
  async generateText(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return `[モック生成]\n\n${prompt.substring(0, 100)}...\n\n※ OPENAI_API_KEY が未設定のためモックレスポンスを返しています。`;
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return content;
      }
      throw new Error("No text content in response");
    } catch (error) {
      console.error("OpenAI generateText error:", error);
      throw new Error(`Failed to generate text: ${error.message}`);
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
    if (!process.env.OPENAI_API_KEY) {
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
${applicantName || "応募者"}様

${jobTitle ? `【応募求人】\n${jobTitle}\n` : ""}
【問い合わせ内容】
${inquiryContent}

適切な返信メールを作成してください。`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return content;
      }

      throw new Error("No text content in response");
    } catch (error) {
      console.error("OpenAI API error:", error);
      console.warn("⚠️ Falling back to mock inquiry response");
      return this.generateMockInquiryResponse(params);
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
    } = params;

    return `# ${title}

あなたの経験とスキルを活かして、次のキャリアステップを一緒に歩みませんか？

## 🎯 募集ポジション

私たちは、${title}として活躍していただける方を募集しています。
チームの一員として、革新的なプロジェクトに携わり、成長を実感できる環境をご用意しています。

## 📍 勤務条件

**勤務地:** ${location || "東京都内（リモートワーク可）"}
**給与:** ${salary || "経験・スキルに応じて優遇"}
**雇用形態:** ${employmentType || "正社員"}

## 💼 仕事内容

${
  description ||
  `${title}として、以下の業務を担当していただきます：

• プロジェクトの企画・設計・実装
• チームメンバーとの協力によるサービス開発
• 新しい技術の導入と最適化
• コードレビューと品質管理

最新の技術スタックを使用し、自己成長とチーム貢献を両立できる環境です。`
}

## ✨ 応募要件

${
  requirements ||
  `【必須スキル】
• 実務経験2年以上
• チームでの開発経験
• 新しい技術への学習意欲

【歓迎スキル】
• リーダー経験
• OSSへの貢献経験
• 英語でのコミュニケーション能力`
}

## 🌟 私たちが提供できること

• 最新技術に触れる機会
• フレックスタイム制度
• リモートワーク制度
• 充実した研修制度
• 成長を実感できる環境

---

💡 このテキストはデモ用のサンプルです。
実際の運用では、AIが求人情報を基に魅力的な文章を自動生成します。`;
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

    return `${applicantName || "応募者"}様

お問い合わせありがとうございます。

${jobTitle ? `【${jobTitle}】へのご応募に関するお問い合わせですね。\n` : ""}
【お問い合わせ内容】
${inquiryContent}

【回答】
お問い合わせいただいた内容について、担当者より詳細をご案内させていただきます。
※このメッセージはモックで生成されています（OPENAI_API_KEYが未設定）。
※本番環境ではOpenAI GPT-4oを使用して適切な返信が生成されます。

何かご不明点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。`;
  }

  /**
   * 履歴書を解析・修正
   */
  async analyzeAndCorrectResume(originalText: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return this.generateMockResumeCorrection(originalText);
    }

    const systemPrompt = `あなたは優秀な採用コンサルタントです。応募者が提出した履歴書・職務経歴書を読み、以下の観点で改善・修正してください。

改善の観点:
- 誤字・脱字・文法の修正
- 敬語・丁寧語の統一
- 職歴・スキルの具体的な数値化（「〜に携わった」→「〜を担当し、XX%改善に貢献」など）
- アピールポイントの強調と整理
- 採用担当者が読みやすい構成への再整理
- 不足している項目の補足提案（コメントとして）

修正後の履歴書を日本語で出力してください。修正箇所には【修正】タグ、補足提案には【提案】タグを付けて明示してください。`;

    const userPrompt = `以下の履歴書を改善してください。\n\n${originalText}`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 4000,
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) return content;
      throw new Error("No content in response");
    } catch (error) {
      console.error("OpenAI analyzeResume error:", error);
      return this.generateMockResumeCorrection(originalText);
    }
  }

  private generateMockResumeCorrection(originalText: string): string {
    return `【AI修正済み履歴書】（モック）

${originalText.substring(0, 200)}...

【修正】誤字・脱字を修正しました。
【修正】職歴の記述を具体的な数値を用いて強化しました。
【提案】スキルセクションにプログラミング言語・ツールの習熟度を追加することを推奨します。
【提案】志望動機に応募先企業の特徴に合わせた記述を追加することを推奨します。

※ OPENAI_API_KEY が未設定のためモックレスポンスを返しています。`;
  }

  /**
   * 画像を生成（Gemini API - Imagen 3）
   */
  async generateImage(params: {
    prompt: string;
    aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
    imageSize?: "1K" | "2K" | "4K";
  }): Promise<{ imageData: string; mimeType: string }> {
    const { prompt, aspectRatio = "1:1", imageSize = "1K" } = params;

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
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "image/png",
        },
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
              mimeType: part.inlineData.mimeType || "image/png",
            };
          }
        }
      }

      throw new Error("No image data in response");
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  /**
   * モック: 画像生成
   */
  private generateMockImage(params: { prompt: string }): {
    imageData: string;
    mimeType: string;
  } {
    // 1x1 透明PNG画像のbase64データ（モック）
    const mockImageData =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    console.log(
      `🖼️ Mock image generation (GEMINI_API_KEY not set): ${params.prompt}`,
    );

    return {
      imageData: mockImageData,
      mimeType: "image/png",
    };
  }
}
