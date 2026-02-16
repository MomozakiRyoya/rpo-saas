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
}
