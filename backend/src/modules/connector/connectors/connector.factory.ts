import { BaseConnector } from "./base.connector";
import { IndeedConnector } from "./indeed.connector";
import { KyujinBoxConnector } from "./kyujin-box.connector";

export class ConnectorFactory {
  static create(type: string, config: Record<string, any>): BaseConnector {
    switch (type) {
      case "indeed":
        return new IndeedConnector(config);
      case "kyujin-box":
        return new KyujinBoxConnector(config);
      case "dummy":
        // ダミーコネクタ（モック）
        return new DummyConnector(config);
      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  }
}

/**
 * ダミーコネクタ（テスト用）
 */
class DummyConnector extends BaseConnector {
  async publish(jobData: any) {
    console.log("📝 Dummy connector: publish", jobData.title);
    return {
      success: true,
      externalId: `dummy-${Date.now()}`,
    };
  }

  async update(externalId: string, jobData: any) {
    console.log("📝 Dummy connector: update", externalId, jobData.title);
    return {
      success: true,
      externalId,
    };
  }

  async stop(externalId: string) {
    console.log("📝 Dummy connector: stop", externalId);
    return {
      success: true,
      externalId,
    };
  }

  async testConnection() {
    console.log("📝 Dummy connector: test connection");
    return true;
  }

  async replyToInquiry(externalInquiryId: string, message: string) {
    console.log(
      "📝 Dummy connector: replyToInquiry",
      externalInquiryId,
      message,
    );
    return { success: true };
  }
}
