/**
 * 求人媒体コネクタの基底インターフェース
 */
export interface JobData {
  title: string;
  description: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  requirements?: string;
}

export interface PublicationResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface InquiryData {
  externalId: string;
  applicantName?: string;
  applicantEmail?: string;
  content: string;
  createdAt?: Date;
}

export interface ReplyResult {
  success: boolean;
  error?: string;
}

export abstract class BaseConnector {
  protected config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  /**
   * 求人を掲載
   */
  abstract publish(jobData: JobData): Promise<PublicationResult>;

  /**
   * 求人を更新
   */
  abstract update(
    externalId: string,
    jobData: JobData,
  ): Promise<PublicationResult>;

  /**
   * 求人を停止
   */
  abstract stop(externalId: string): Promise<PublicationResult>;

  /**
   * 接続テスト
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * 問い合わせに返信（オプション）
   */
  async replyToInquiry(
    externalInquiryId: string,
    message: string,
  ): Promise<ReplyResult> {
    return {
      success: false,
      error: "This connector does not support direct replies",
    };
  }

  /**
   * 問い合わせ一覧を取得（オプション）
   */
  async fetchInquiries(externalJobId: string): Promise<InquiryData[]> {
    return [];
  }
}
