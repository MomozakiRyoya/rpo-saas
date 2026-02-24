import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // テナント作成
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: {
      name: "デモRPO株式会社",
      slug: "demo-company",
    },
  });

  console.log("✅ Tenant created:", tenant.name);

  // ハッシュ化
  const hashedPassword = await bcrypt.hash("password123", 10);

  // RPOスタッフユーザー作成
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "管理者ユーザー",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: tenant.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {},
    create: {
      email: "manager@demo.com",
      name: "マネージャー",
      password: hashedPassword,
      role: "MANAGER",
      tenantId: tenant.id,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: {
      email: "member@demo.com",
      name: "メンバー",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: tenant.id,
    },
  });

  console.log(
    "✅ Staff users created: admin, manager, member (password: password123)",
  );

  // 顧客企業作成
  const customer1 = await prisma.customer.upsert({
    where: { id: "seed-customer1-id-0001" },
    update: {
      name: "株式会社サンプルテック",
      description: "IT企業、従業員100名",
    },
    create: {
      id: "seed-customer1-id-0001",
      name: "株式会社サンプルテック",
      description: "IT企業、従業員100名",
      tenantId: tenant.id,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: "seed-customer2-id-0002" },
    update: {
      name: "株式会社デモコーポレーション",
      description: "製造業、従業員500名",
    },
    create: {
      id: "seed-customer2-id-0002",
      name: "株式会社デモコーポレーション",
      description: "製造業、従業員500名",
      tenantId: tenant.id,
    },
  });

  console.log("✅ Customers created");

  // 顧客ポータルユーザー作成
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {
      customerId: customer1.id,
      password: hashedPassword,
      role: "CUSTOMER",
    },
    create: {
      email: "customer@demo.com",
      name: "サンプルテック担当者",
      password: hashedPassword,
      role: "CUSTOMER",
      tenantId: tenant.id,
      customerId: customer1.id,
    },
  });

  console.log(
    "✅ Customer portal user created: customer@demo.com (password: password123)",
  );

  // 求人作成（upsertで冪等性確保）
  const job1 = await prisma.job.upsert({
    where: { id: "seed-job1-id-000001" },
    update: {},
    create: {
      id: "seed-job1-id-000001",
      title: "Webエンジニア（フルスタック）",
      description: "Ruby on RailsとReactでの開発経験者募集",
      location: "東京都渋谷区",
      salary: "年収500-800万円",
      employmentType: "正社員",
      requirements: "Ruby on Rails経験3年以上、React経験1年以上",
      status: "PENDING_APPROVAL",
      customerId: customer1.id,
    },
  });

  const job2 = await prisma.job.upsert({
    where: { id: "seed-job2-id-000002" },
    update: {},
    create: {
      id: "seed-job2-id-000002",
      title: "データサイエンティスト",
      description: "機械学習モデルの開発・運用",
      location: "東京都港区（リモート可）",
      salary: "年収700-1000万円",
      employmentType: "正社員",
      requirements: "Python経験3年以上、機械学習プロジェクト経験",
      status: "PUBLISHED",
      customerId: customer1.id,
    },
  });

  const job3 = await prisma.job.upsert({
    where: { id: "seed-job3-id-000003" },
    update: {},
    create: {
      id: "seed-job3-id-000003",
      title: "製造ラインマネージャー",
      description: "製造現場の管理・改善業務",
      location: "埼玉県川口市",
      salary: "年収600-750万円",
      employmentType: "正社員",
      requirements: "製造業経験5年以上、マネジメント経験必須",
      status: "DRAFT",
      customerId: customer2.id,
    },
  });

  console.log("✅ Jobs created");

  // job1 の承認レコード作成（PENDING_APPROVAL 状態なので）
  const existingApproval = await prisma.approval.findFirst({
    where: { jobId: job1.id, status: "PENDING" },
  });

  if (!existingApproval) {
    await prisma.approval.create({
      data: {
        jobId: job1.id,
        status: "PENDING",
        textVersion: 1,
        imageVersion: null,
      },
    });
    console.log("✅ Pending approval created for job1");
  }

  // コネクタ作成
  const dummyConnector = await prisma.connector.upsert({
    where: { id: "seed-connector-id-0001" },
    update: {},
    create: {
      id: "seed-connector-id-0001",
      name: "ダミー媒体",
      type: "dummy",
      config: {
        apiUrl: "https://dummy-api.example.com",
        apiKey: "dummy-key",
      },
      isActive: true,
    },
  });

  console.log("✅ Dummy connector created");

  // サンプル分析データ（job1, job2 各7日分）
  const today = new Date();
  for (const jobId of [job1.id, job2.id]) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await prisma.dailyMetric.upsert({
        where: {
          date_jobId_connectorId: {
            date,
            jobId,
            connectorId: dummyConnector.id,
          },
        },
        update: {},
        create: {
          date,
          jobId,
          connectorId: dummyConnector.id,
          impressions: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 50) + 20,
          applications: Math.floor(Math.random() * 10) + 1,
          clickRate: parseFloat((Math.random() * 5 + 2).toFixed(2)),
          applicationRate: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        },
      });
    }
  }

  console.log("✅ Sample analytics data created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Test credentials:");
  console.log("  RPO Staff:");
  console.log("    Admin:   admin@demo.com / password123");
  console.log("    Manager: manager@demo.com / password123");
  console.log("    Member:  member@demo.com / password123");
  console.log("  Customer Portal:");
  console.log("    Customer: customer@demo.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
