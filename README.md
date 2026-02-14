# RPO-SaaS MVP

RPO会社向けSaaS。求人作成・更新の自動化、求人分析、問い合わせ対応、日程調整を複数媒体API連携で実現します。

## 🚀 すぐにデプロイ

### 🌟 Vercel のみで完結 (推奨)

**Vercel だけで全て完結！最も簡単な方法**

📘 **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** - Vercel のみでデプロイ

- **バックエンド**: Vercel Serverless Functions
- **フロントエンド**: Vercel
- **データベース**: Vercel Postgres
- **コスト**: 無料枠で開始可能 ($0/月)

### 🔧 Railway + Vercel (代替)

📗 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Railway + Vercel

- より柔軟なバックエンド運用が必要な場合はこちら

---

## 📋 技術スタック

- **Backend:** NestJS + TypeScript
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Database:** PostgreSQL
- **Cache/Queue:** Redis + BullMQ
- **ORM:** Prisma
- **API Documentation:** Swagger (OpenAPI)

## 🚀 クイックスタート

### 前提条件

- Docker & Docker Compose
- Node.js 20+ (ローカル開発時)
- npm

### 1. リポジトリのクローン（または移動）

```bash
cd /Users/momozaki/dev/rpo-saas
```

### 2. Docker Composeで起動

```bash
docker-compose up -d
```

これで以下のサービスが起動します：

- **PostgreSQL** - ポート 5432
- **Redis** - ポート 6379
- **Backend (NestJS)** - ポート 3001
- **Frontend (Next.js)** - ポート 3000

### 3. データベースのマイグレーションとシード

初回起動時、backendコンテナ内で自動的にマイグレーションが実行されます。
サンプルデータを投入するには：

```bash
docker-compose exec backend npm run prisma:seed
```

### 4. 動作確認

- **Frontend:** http://localhost:3000
- **Backend API Documentation (Swagger):** http://localhost:3001/api/docs
- **Backend Health Check:** http://localhost:3001/api/auth/me (要認証)

## 🧪 テストユーザー

Seedを実行すると以下のテストユーザーが作成されます：

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@demo.com    | password123 |
| Manager | manager@demo.com  | password123 |
| Member  | member@demo.com   | password123 |

## 📂 ディレクトリ構成

```
rpo-saas/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── modules/       # 機能モジュール
│   │   ├── common/        # 共通機能（guards, interceptorsなど）
│   │   ├── prisma/        # Prismaクライアント
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma  # DBスキーマ
│   │   └── seed.ts        # サンプルデータ
│   ├── Dockerfile
│   └── package.json
├── frontend/              # Next.js
│   ├── app/               # App Router
│   ├── components/        # Reactコンポーネント
│   ├── lib/               # ユーティリティ
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── API_ENDPOINTS.md       # API仕様
├── SCREENS.md             # 画面一覧
└── README.md
```

## 🛠️ ローカル開発（Dockerなし）

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📚 API ドキュメント

起動後、Swagger UIで全エンドポイントを確認できます：

http://localhost:3001/api/docs

主要なエンドポイント：

- **認証:** `POST /api/auth/login`, `POST /api/auth/register`
- **顧客管理:** `GET /api/customers`, `POST /api/customers`
- **求人管理:** `GET /api/jobs`, `POST /api/jobs`
- **テキスト生成:** `POST /api/generation/text`
- **画像生成:** `POST /api/generation/image`
- **承認フロー:** `GET /api/approvals`, `POST /api/approvals/:id/approve`
- **掲載管理:** `POST /api/publications`, `POST /api/publications/:id/stop`
- **問い合わせ:** `GET /api/inquiries`, `POST /api/inquiries/:id/generate-response`
- **日程調整:** `POST /api/schedules`, `POST /api/schedules/:id/confirm`
- **分析:** `GET /api/analytics/daily`, `GET /api/analytics/summary`

詳細は [API_ENDPOINTS.md](./API_ENDPOINTS.md) を参照してください。

## 🎨 画面一覧

実装予定の画面は [SCREENS.md](./SCREENS.md) を参照してください。

## 🧑‍💻 開発の進め方

### ステップ1: 設計確認 ✅

- [x] DBスキーマ設計
- [x] APIエンドポイント設計
- [x] 画面一覧設計

### ステップ2: 初期起動 ✅

- [x] docker-compose設定
- [x] Backend基本構成
- [x] Frontend基本構成
- [x] Prismaセットアップ

### ステップ3: MVP機能実装 ✅

- [x] ログイン画面
- [x] 顧客一覧・作成
- [x] 求人一覧・作成・編集
- [x] テキスト・画像生成機能
- [x] 承認フロー
- [x] 媒体掲載機能（API）

### ステップ4: 追加機能 ✅

- [x] 問い合わせ対応
- [x] 日程調整
- [x] 分析ダッシュボード

### ステップ5: テストとドキュメント ✅

- [x] Unitテスト
- [x] APIテスト (E2E)
- [x] 動作確認手順

## 🧪 テスト

詳細は [TESTING.md](./TESTING.md) を参照してください。

```bash
cd backend

# ユニットテスト
npm test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:cov
```

## 🐛 トラブルシューティング

### Dockerコンテナが起動しない

```bash
docker-compose down -v
docker-compose up -d --build
```

### マイグレーションエラー

```bash
docker-compose exec backend npx prisma migrate reset
docker-compose exec backend npm run prisma:seed
```

### ポートが既に使用されている

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3001
lsof -i :5432
lsof -i :6379

# プロセスを終了
kill -9 <PID>
```

## 📝 TODO（実装時の注意点）

- [ ] LLM統合（現在はモック）
  - テキスト生成: `backend/src/modules/generation/generation.service.ts`
  - 返信案生成: `backend/src/modules/inquiry/inquiry.service.ts`
- [ ] 画像生成統合（現在はダミーURL）
  - `backend/src/modules/generation/generation.service.ts`
- [ ] 実媒体API連携（現在はダミー媒体）
  - コネクタ実装: `backend/src/modules/connector/`
- [ ] カレンダー統合（Google Calendar等）
  - `backend/src/modules/schedule/schedule.service.ts`
- [ ] メール送信機能
  - 問い合わせ返信送信時
- [ ] 非同期ジョブ実装（BullMQ）
  - 掲載実行、生成処理など

## 🔒 セキュリティ

- JWT_SECRETは本番環境で必ず変更してください（`.env`ファイル）
- 本番環境ではHTTPSを使用してください
- CORSの設定を本番環境に合わせて調整してください

## 📄 ライセンス

ISC
