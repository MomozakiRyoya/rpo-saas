import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

// pdfkitはCommonJSモジュールのため requireで読み込む
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require("pdfkit");

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateJobReport(jobId: string, tenantId: string): Promise<Buffer> {
    // Verify the job belongs to the tenant
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, customer: { tenantId } },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        approvals: {
          orderBy: { requestedAt: "desc" },
          take: 1,
        },
        publications: {
          include: { connector: { select: { name: true } } },
        },
      },
    });

    if (!job) throw new NotFoundException("Job not found");

    const jobWithRelations = job as typeof job & {
      customer: { id: string; name: string } | null;
      publications: Array<{
        connector: { name: string } | null;
        status: string;
        publishedAt: Date | null;
      }>;
    };

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // フォントを登録（日本語対応のためHelveticaを使用）
      doc.font("Helvetica");

      // ヘッダー
      doc
        .fontSize(24)
        .fillColor("#4F46E5")
        .text("Job Report", { align: "center" });

      doc.moveDown();

      // 区切り線
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor("#e5e7eb")
        .stroke();

      doc.moveDown();

      // 基本情報
      doc.fontSize(18).fillColor("#111827").text("Job Information");
      doc.moveDown(0.5);

      this.addLabelValue(doc, "Title", job.title);
      this.addLabelValue(doc, "Status", job.status);
      this.addLabelValue(
        doc,
        "Customer",
        jobWithRelations.customer?.name ?? "-",
      );
      this.addLabelValue(doc, "Location", job.location ?? "-");
      this.addLabelValue(doc, "Salary", job.salary ?? "-");
      this.addLabelValue(doc, "Employment Type", job.employmentType ?? "-");
      this.addLabelValue(
        doc,
        "Created At",
        job.createdAt.toLocaleDateString("ja-JP"),
      );

      doc.moveDown();

      // 説明
      doc.fontSize(18).fillColor("#111827").text("Description");
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .fillColor("#374151")
        .text(job.description ?? "No description provided.");

      doc.moveDown();

      // 応募要件
      if (job.requirements) {
        doc.fontSize(18).fillColor("#111827").text("Requirements");
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#374151").text(job.requirements);
        doc.moveDown();
      }

      // 掲載状況
      if (
        jobWithRelations.publications &&
        jobWithRelations.publications.length > 0
      ) {
        doc.fontSize(18).fillColor("#111827").text("Publications");
        doc.moveDown(0.5);
        for (const pub of jobWithRelations.publications) {
          doc
            .fontSize(11)
            .fillColor("#374151")
            .text(
              `- ${pub.connector?.name ?? "Unknown"}: ${pub.status} (${pub.publishedAt?.toLocaleDateString("ja-JP") ?? "-"})`,
            );
        }
        doc.moveDown();
      }

      // フッター
      doc
        .fontSize(9)
        .fillColor("#6b7280")
        .text(
          `Generated at: ${new Date().toLocaleString("ja-JP")}`,
          50,
          doc.page.height - 70,
          { align: "center" },
        );

      doc.end();
    });
  }

  async generateMonthlyReport(
    tenantId: string,
    month: string,
  ): Promise<Buffer> {
    // month format: '2026-02'
    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error("Invalid month format. Use YYYY-MM");
    }

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // テナントのジョブIDを取得
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    const jobs = await this.prisma.job.findMany({
      where: { customerId: { in: customerIds } },
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    // DailyMetric を取得
    const metrics = await this.prisma.dailyMetric.findMany({
      where: {
        jobId: { in: jobIds },
        date: { gte: startDate, lte: endDate },
      },
    });

    // 集計
    const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalApplications = metrics.reduce(
      (sum, m) => sum + m.applications,
      0,
    );
    const avgClickRate =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.clickRate ?? 0), 0) /
          metrics.length
        : 0;

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.font("Helvetica");

      // ヘッダー
      doc
        .fontSize(24)
        .fillColor("#4F46E5")
        .text(`Monthly Report: ${month}`, { align: "center" });

      doc.moveDown();

      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor("#e5e7eb")
        .stroke();

      doc.moveDown();

      // サマリー
      doc.fontSize(18).fillColor("#111827").text("Summary");
      doc.moveDown(0.5);

      this.addLabelValue(
        doc,
        "Period",
        `${startDate.toLocaleDateString("ja-JP")} - ${endDate.toLocaleDateString("ja-JP")}`,
      );
      this.addLabelValue(doc, "Total Jobs", String(jobs.length));
      this.addLabelValue(
        doc,
        "Total Impressions",
        totalImpressions.toLocaleString(),
      );
      this.addLabelValue(doc, "Total Clicks", totalClicks.toLocaleString());
      this.addLabelValue(
        doc,
        "Total Applications",
        totalApplications.toLocaleString(),
      );
      this.addLabelValue(
        doc,
        "Average Click Rate",
        `${avgClickRate.toFixed(2)}%`,
      );

      doc.moveDown();

      // 日別メトリクス（上位10件）
      if (metrics.length > 0) {
        doc
          .fontSize(18)
          .fillColor("#111827")
          .text("Daily Metrics (Top 10 by Date)");
        doc.moveDown(0.5);

        const sortedMetrics = [...metrics]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 10);

        // ヘッダー行
        doc.fontSize(10).fillColor("#6b7280");
        const colWidths = [100, 80, 80, 100];
        const startX = 50;
        let x = startX;
        const headers = ["Date", "Impressions", "Clicks", "Applications"];
        for (let i = 0; i < headers.length; i++) {
          doc.text(headers[i], x, doc.y, { width: colWidths[i] });
          x += colWidths[i];
        }
        doc.moveDown(0.3);

        doc
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .strokeColor("#e5e7eb")
          .stroke();

        doc.moveDown(0.3);

        for (const metric of sortedMetrics) {
          x = startX;
          const rowY = doc.y;
          doc.fontSize(10).fillColor("#374151");
          const cols = [
            new Date(metric.date).toLocaleDateString("ja-JP"),
            metric.impressions.toLocaleString(),
            metric.clicks.toLocaleString(),
            metric.applications.toLocaleString(),
          ];
          for (let i = 0; i < cols.length; i++) {
            doc.text(cols[i], x, rowY, { width: colWidths[i] });
            x += colWidths[i];
          }
          doc.moveDown(0.5);
        }
      } else {
        doc
          .fontSize(11)
          .fillColor("#6b7280")
          .text("No metrics data for this period.");
      }

      // フッター
      doc
        .fontSize(9)
        .fillColor("#6b7280")
        .text(
          `Generated at: ${new Date().toLocaleString("ja-JP")}`,
          50,
          doc.page.height - 70,
          { align: "center" },
        );

      doc.end();
    });
  }

  private addLabelValue(doc: any, label: string, value: string) {
    doc
      .fontSize(11)
      .fillColor("#6b7280")
      .text(`${label}: `, { continued: true })
      .fillColor("#111827")
      .text(value);
    doc.moveDown(0.3);
  }
}
