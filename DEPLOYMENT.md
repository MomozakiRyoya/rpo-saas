# RPO-SaaS デプロイガイド

## 🚀 クイックデプロイ (Railway + Vercel)

### 前提条件
- GitHubアカウント
- Railwayアカウント (https://railway.app)
- Vercelアカウント (https://vercel.com)

---

## ステップ1️⃣: GitHubにプッシュ

```bash
cd /Users/momozaki/dev/rpo-saas

# Gitリポジトリ初期化 (まだの場合)
git init
git add .
git commit -m "Initial commit: RPO-SaaS MVP"

# GitHubにプッシュ
# (GitHubで新規リポジトリを作成してから以下を実行)
git remote add origin https://github.com/YOUR_USERNAME/rpo-saas.git
git branch -M main
git push -u origin main
```

---

## ステップ2️⃣: バックエンドをRailwayにデプロイ

### 2-1. PostgreSQLデータベースを作成

1. https://railway.app にアクセス
2. 「New Project」→「Provision PostgreSQL」をクリック
3. データベースが作成されたら、「Variables」タブで `DATABASE_URL` をコピー

### 2-2. バックエンドサービスを追加

1. 同じプロジェクト内で「New Service」→「GitHub Repo」を選択
2. リポジトリ `rpo-saas` を選択
3. Root Directory を `backend` に設定

### 2-3. 環境変数を設定

「Variables」タブで以下を追加:

```env
DATABASE_URL=<PostgreSQLからコピーしたURL>
REDIS_HOST=<Redis URLを設定 or 別途Redisサービスを追加>
REDIS_PORT=6379
JWT_SECRET=<ランダムな文字列を生成>
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

**JWT_SECRET生成方法:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2-4. Redisサービスを追加 (オプションだが推奨)

1. 同じプロジェクトで「New Service」→「Redis」
2. Redisが起動したら、`REDIS_HOST` と `REDIS_PORT` を環境変数に設定

### 2-5. デプロイ

- Railwayが自動的にビルド・デプロイを開始します
- 「Settings」→「Networking」で公開URLを確認
- 例: `https://rpo-saas-backend-production.up.railway.app`

### 2-6. シードデータ投入 (初回のみ)

デプロイ後、Railwayのコンソールで:
```bash
npm run prisma:seed
```

---

## ステップ3️⃣: フロントエンドをVercelにデプロイ

### 3-1. Vercelでプロジェクトをインポート

1. https://vercel.com にアクセス
2. 「Add New」→「Project」
3. GitHubリポジトリ `rpo-saas` を選択
4. **Root Directory** を `frontend` に設定

### 3-2. ビルド設定

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3-3. 環境変数を設定

```env
NEXT_PUBLIC_API_URL=https://rpo-saas-backend-production.up.railway.app
```

### 3-4. デプロイ

- 「Deploy」をクリック
- デプロイが完了したら、URLが発行されます
- 例: `https://rpo-saas.vercel.app`

### 3-5. RailwayのFRONTEND_URLを更新

Railwayの環境変数 `FRONTEND_URL` を Vercel の URL に更新:
```env
FRONTEND_URL=https://rpo-saas.vercel.app
```

---

## ステップ4️⃣: 動作確認

### バックエンドAPI
```
https://rpo-saas-backend-production.up.railway.app/api/docs
```
→ Swagger UI が表示されればOK

### フロントエンド
```
https://rpo-saas.vercel.app
```
→ ログイン画面が表示されればOK

### テストログイン
```
Email: admin@demo.com
Password: password123
```

---

## 🎉 完了！

以下のURLでアプリケーションにアクセスできます:

- **フロントエンド**: https://rpo-saas.vercel.app
- **API**: https://rpo-saas-backend-production.up.railway.app
- **API Docs**: https://rpo-saas-backend-production.up.railway.app/api/docs

---

## 📝 補足

### カスタムドメインの設定

#### Vercel (フロントエンド)
1. Vercelプロジェクトの「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

#### Railway (バックエンド)
1. Railwayプロジェクトの「Settings」→「Networking」
2. カスタムドメインを追加
3. CNAMEレコードを設定

### 自動デプロイ

- **main ブランチにプッシュ** → 自動的に本番環境にデプロイ
- **他のブランチにプッシュ** → プレビュー環境が作成される

### コスト

#### Railway (無料枠)
- $5/月の無料クレジット
- PostgreSQL + Redis + Backend で約$5-10/月

#### Vercel (無料枠)
- Hobbyプラン: 無料
- 商用利用の場合は Pro プラン ($20/月) が必要

---

## トラブルシューティング

### バックエンドが起動しない
→ Railwayのログを確認: `Build Logs` と `Deploy Logs`

### データベース接続エラー
→ `DATABASE_URL` が正しく設定されているか確認

### フロントエンドからAPIに接続できない
→ `NEXT_PUBLIC_API_URL` が正しいか確認
→ RailwayのCORS設定を確認 (`FRONTEND_URL`)

### Prismaマイグレーションエラー
→ デプロイ時に `prisma db push` が自動実行されます
→ 手動で実行する場合: Railwayのコンソールで `npx prisma db push`
