import {
  BaseConnector,
  JobData,
  PublicationResult,
  ReplyResult,
} from "./base.connector";

/**
 * 求人ボックス コネクタ
 *
 * 設定例:
 * {
 *   apiKey: "your-kyujin-box-api-key",
 *   companyId: "your-company-id",
 *   apiUrl: "https://api.kyujinbox.com/v1"
 * }
 */
export class KyujinBoxConnector extends BaseConnector {
  async publish(jobData: JobData): Promise<PublicationResult> {
    const { apiKey, companyId, apiUrl } = this.config;

    if (!apiKey || !companyId) {
      return {
        success: false,
        error: "求人ボックスAPI認証情報が設定されていません",
      };
    }

    try {
      // 求人ボックス API へのPOSTリクエスト
      const response = await fetch(
        `${apiUrl || "https://api.kyujinbox.com/v1"}/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            company_id: companyId,
            job_title: jobData.title,
            job_description: jobData.description,
            work_location: jobData.location,
            salary_info: jobData.salary,
            employment_type: jobData.employmentType,
            qualifications: jobData.requirements,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `求人ボックスAPI error: ${response.status} ${errorText}`,
        };
      }

      const data = await response.json();
      const externalId = data.job_id || `kyujinbox-${Date.now()}`;

      console.log(`✅ 求人ボックス掲載成功: ${externalId}`);
      return {
        success: true,
        externalId,
      };
    } catch (error) {
      console.error("求人ボックス API error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async update(
    externalId: string,
    jobData: JobData,
  ): Promise<PublicationResult> {
    const { apiKey, apiUrl } = this.config;

    try {
      const response = await fetch(
        `${apiUrl || "https://api.kyujinbox.com/v1"}/jobs/${externalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            job_title: jobData.title,
            job_description: jobData.description,
            work_location: jobData.location,
            salary_info: jobData.salary,
            employment_type: jobData.employmentType,
            qualifications: jobData.requirements,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `求人ボックスAPI error: ${response.status} ${errorText}`,
        };
      }

      console.log(`✅ 求人ボックス更新成功: ${externalId}`);
      return {
        success: true,
        externalId,
      };
    } catch (error) {
      console.error("求人ボックス update error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async stop(externalId: string): Promise<PublicationResult> {
    const { apiKey, apiUrl } = this.config;

    try {
      const response = await fetch(
        `${apiUrl || "https://api.kyujinbox.com/v1"}/jobs/${externalId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            status: "closed",
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `求人ボックスAPI error: ${response.status} ${errorText}`,
        };
      }

      console.log(`✅ 求人ボックス停止成功: ${externalId}`);
      return {
        success: true,
        externalId,
      };
    } catch (error) {
      console.error("求人ボックス stop error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    const { apiKey, apiUrl } = this.config;

    if (!apiKey) {
      return false;
    }

    try {
      // 接続テスト
      const response = await fetch(
        `${apiUrl || "https://api.kyujinbox.com/v1"}/auth/verify`,
        {
          method: "GET",
          headers: {
            "X-API-Key": apiKey,
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("求人ボックス connection test failed:", error);
      return false;
    }
  }

  async replyToInquiry(
    externalInquiryId: string,
    message: string,
  ): Promise<ReplyResult> {
    const { apiKey, apiUrl } = this.config;
    if (!apiKey)
      return { success: false, error: "求人ボックスAPIキーが未設定" };
    try {
      const response = await fetch(
        `${apiUrl || "https://api.kyujinbox.com/v1"}/inquiries/${externalInquiryId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({ reply_text: message }),
        },
      );
      if (!response.ok) {
        return {
          success: false,
          error: `求人ボックスAPI error: ${response.status}`,
        };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
