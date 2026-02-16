// ジョブの型定義

export enum QueueName {
  TEXT_GENERATION = 'text-generation',
  IMAGE_GENERATION = 'image-generation',
  PUBLICATION = 'publication',
  EMAIL = 'email',
}

// テキスト生成ジョブ
export interface TextGenerationJobData {
  jobId: string;
  tenantId: string;
  prompt?: string;
}

// 画像生成ジョブ
export interface ImageGenerationJobData {
  jobId: string;
  tenantId: string;
  prompt?: string;
}

// 掲載実行ジョブ
export interface PublicationJobData {
  publicationId: string;
  jobId: string;
  connectorId: string;
  tenantId: string;
}

// メール送信ジョブ
export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  template?: string;
  data?: Record<string, any>;
}

// ジョブ結果
export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
}
