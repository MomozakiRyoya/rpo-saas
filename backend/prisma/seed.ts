import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // テナント作成
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'デモRPO株式会社',
      slug: 'demo-company',
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // ユーザー作成
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: '管理者ユーザー',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@demo.com' },
    update: {},
    create: {
      email: 'manager@demo.com',
      name: 'マネージャー',
      password: hashedPassword,
      role: 'MANAGER',
      tenantId: tenant.id,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@demo.com' },
    update: {},
    create: {
      email: 'member@demo.com',
      name: 'メンバー',
      password: hashedPassword,
      role: 'MEMBER',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Users created: admin, manager, member (password: password123)');

  // 顧客企業作成
  const customer1 = await prisma.customer.create({
    data: {
      name: '株式会社サンプルテック',
      description: 'IT企業、従業員100名',
      tenantId: tenant.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: '株式会社デモコーポレーション',
      description: '製造業、従業員500名',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Customers created');

  // 求人作成
  const job1 = await prisma.job.create({
    data: {
      title: 'Webエンジニア（フルスタック）',
      description: 'Ruby on RailsとReactでの開発経験者募集',
      location: '東京都渋谷区',
      salary: '年収500-800万円',
      employmentType: '正社員',
      requirements: 'Ruby on Rails経験3年以上、React経験1年以上',
      status: 'DRAFT',
      customerId: customer1.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'データサイエンティスト',
      description: '機械学習モデルの開発・運用',
      location: '東京都港区（リモート可）',
      salary: '年収700-1000万円',
      employmentType: '正社員',
      requirements: 'Python経験3年以上、機械学習プロジェクト経験',
      status: 'GENERATED',
      customerId: customer1.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: '製造ラインマネージャー',
      description: '製造現場の管理・改善業務',
      location: '埼玉県川口市',
      salary: '年収600-750万円',
      employmentType: '正社員',
      requirements: '製造業経験5年以上、マネジメント経験必須',
      status: 'DRAFT',
      customerId: customer2.id,
    },
  });

  console.log('✅ Jobs created');

  // コネクタ作成（ダミー媒体）
  const dummyConnector = await prisma.connector.create({
    data: {
      name: 'ダミー媒体',
      type: 'dummy',
      config: {
        apiUrl: 'https://dummy-api.example.com',
        apiKey: 'dummy-key',
      },
      isActive: true,
    },
  });

  console.log('✅ Dummy connector created');

  // サンプル分析データ
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    await prisma.dailyMetric.create({
      data: {
        date,
        jobId: job1.id,
        connectorId: dummyConnector.id,
        impressions: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 50) + 20,
        applications: Math.floor(Math.random() * 10) + 1,
        clickRate: (Math.random() * 5 + 2).toFixed(2) as any,
        applicationRate: (Math.random() * 2 + 0.5).toFixed(2) as any,
      },
    });
  }

  console.log('✅ Sample analytics data created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('  Admin:   admin@demo.com / password123');
  console.log('  Manager: manager@demo.com / password123');
  console.log('  Member:  member@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
