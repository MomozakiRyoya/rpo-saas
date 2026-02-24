import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
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

    const [pendingApprovals, newInquiries] = await Promise.all([
      this.prisma.approval.count({
        where: {
          status: "PENDING",
          job: { customerId: { in: customerIds } },
        },
      }),
      this.prisma.inquiry.count({
        where: {
          status: "RECEIVED",
          jobId: { in: jobIds },
        },
      }),
    ]);

    return {
      pendingApprovals,
      newInquiries,
      total: pendingApprovals + newInquiries,
    };
  }
}
