# Renderへのデプロイ手順

## 1. Render.comにアクセス
https://render.com → Sign Up (GitHubアカウントでログイン)

## 2. 新しいWeb Serviceを作成
1. Dashboard → "New +" → "Web Service"
2. GitHubリポジトリを接続: `MomozakiRyoya/rpo-saas`
3. 以下の設定:

**Basic Settings:**
- Name: `rpo-saas-backend`
- Region: `Oregon (US West)`
- Branch: `main`
- Root Directory: `backend`

**Build & Deploy:**
- Runtime: `Node`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npx prisma db push --accept-data-loss && node dist/src/main.js`

**Instance Type:**
- Plan: `Free` (無料プラン)

## 3. 環境変数を設定

"Environment" タブで以下を追加:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=(RailwayのPostgres URLをコピー)
ANTHROPIC_API_KEY=(Railwayに設定済みの値をコピー)
GEMINI_API_KEY=(Railwayに設定済みの値をコピー)
REDIS_HOST=(RailwayのRedis hostをコピー)
REDIS_PASSWORD=(RailwayのRedis passwordをコピー)
REDIS_PORT=6379
FRONTEND_URL=https://rpo-saas-frontend-production.up.railway.app
JWT_SECRET=your-secret-key
RESEND_API_KEY=(既存のキー)
```

## 4. デプロイ

"Create Web Service" をクリック → 自動的にデプロイが開始されます

## 5. 確認

デプロイ完了後（約3-5分）:
```bash
curl https://your-app.onrender.com/diagnostics
```

✅ APIキーが全て "SET" と表示されれば成功！
