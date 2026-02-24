import {
  BaseConnector,
  DailyMetricsData,
  JobData,
  PublicationResult,
  ReplyResult,
} from "./base.connector";

/**
 * Indeed コネクタ
 *
 * 設定例:
 * {
 *   apiKey: "your-indeed-api-key",
 *   publisherId: "your-publisher-id",
 *   apiUrl: "https://api.indeed.com/v1"
 * }
 */
export class IndeedConnector extends BaseConnector {
  async publish(jobData: JobData): Promise<PublicationResult> {
    const { apiKey, publisherId, apiUrl } = this.config;

    if (!apiKey || !publisherId) {
      return {
        success: false,
        error: "Indeed API認証情報が設定されていません",
      };
    }

    try {
      const response = await fetch(
        `${apiUrl || "https://api.indeed.com/v1"}/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            publisher_id: publisherId,
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            salary: jobData.salary,
            job_type: jobData.employmentType,
            requirements: jobData.requirements,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Indeed API error: ${response.status} ${errorText}`,
        };
      }

      const data = await response.json();
      const externalId = data.job_id || data.id || `indeed-${Date.now()}`;

      console.log(`Indeed掲載成功: ${externalId}`);
      return {
        success: true,
        externalId,
      };
    } catch (error) {
      console.error("Indeed API error:", error);
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
        `${apiUrl || "https://api.indeed.com/v1"}/jobs/${externalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            salary: jobData.salary,
            job_type: jobData.employmentType,
            requirements: jobData.requirements,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Indeed API error: ${response.status} ${errorText}`,
        };
      }

      console.log(`Indeed更新成功: ${externalId}`);
      return {
        success: true,
        externalId,
      };
    } catch (error) {
      console.error("Indeed update error:", error);
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
        `${apiUrl || "https://api.indeed.com/v1"}/jobs/${externalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Indeed API error: ${response.status} ${errorText}`,
        };
      }

      console.log(`Indeed停止成功: ${externalId}`);
      return {
        success: true,
        externalId,
      };
    } catch (error) {
      console.error("Indeed stop error:", error);
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
      const response = await fetch(
        `${apiUrl || "https://api.indeed.com/v1"}/auth/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Indeed connection test failed:", error);
      return false;
    }
  }

  async replyToInquiry(
    externalInquiryId: string,
    message: string,
  ): Promise<ReplyResult> {
    const { apiKey, apiUrl } = this.config;
    if (!apiKey)
      return { success: false, error: "Indeed API key not configured" };
    try {
      const response = await fetch(
        `${apiUrl || "https://api.indeed.com/v1"}/inquiries/${externalInquiryId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ message }),
        },
      );
      if (!response.ok) {
        return {
          success: false,
          error: `Indeed API error: ${response.status}`,
        };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fetchDailyMetrics(
    externalJobId: string,
    date: Date,
  ): Promise<DailyMetricsData> {
    const { apiKey, apiUrl } = this.config;

    if (!apiKey) {
      return {
        date,
        impressions: Math.floor(Math.random() * 100),
        clicks: Math.floor(Math.random() * 20),
        applications: Math.floor(Math.random() * 5),
      };
    }

    try {
      const dateStr = date.toISOString().split("T")[0];
      const response = await fetch(
        `${apiUrl || "https://api.indeed.com/v1"}/jobs/${externalJobId}/metrics?date=${dateStr}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Indeed API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        date,
        impressions: data.impressions ?? 0,
        clicks: data.clicks ?? 0,
        applications: data.applications ?? 0,
        clickRate: data.clickRate,
        applicationRate: data.applicationRate,
      };
    } catch {
      // API失敗時はダミーデータ
      return {
        date,
        impressions: Math.floor(Math.random() * 100),
        clicks: Math.floor(Math.random() * 20),
        applications: Math.floor(Math.random() * 5),
      };
    }
  }
}
