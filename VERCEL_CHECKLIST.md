# ✅ Vercel デプロイ チェックリスト

## 準備 (5分)

- [ ] GitHubアカウント作成済み
- [ ] Vercelアカウント作成済み (https://vercel.com)
- [ ] GitHubリポジトリ作成: `rpo-saas`

```bash
cd /Users/momozaki/dev/rpo-saas
git init
git add .
git commit -m "🎉 Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/rpo-saas.git
git branch -M main
git push -u origin main
```

---

## 1. Vercel Postgres (2分)

- [ ] Vercel → Storage → Create Database → Postgres
- [ ] データベース名: `rpo-saas-db`
- [ ] `.env.local` タブで接続情報を確認

---

## 2. バックエンド (5分)

- [ ] Vercel → Add New → Project
- [ ] リポジトリ: `rpo-saas` を選択
- [ ] プロジェクト名: `rpo-saas-backend`
- [ ] Root Directory: `backend`
- [ ] Framework: `Other`

### 環境変数

- [ ] `DATABASE_URL` = Postgres の `POSTGRES_PRISMA_URL`
- [ ] `POSTGRES_PRISMA_URL` = Postgres の値
- [ ] `JWT_SECRET` = ランダム文字列 (下記で生成)
- [ ] `FRONTEND_URL` = `https://rpo-saas-frontend.vercel.app` (後で更新)
- [ ] `NODE_ENV` = `production`

```bash
# JWT_SECRET 生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] Settings → Environment Variables → Connect Store → Postgres を接続
- [ ] Deploy をクリック
- [ ] デプロイURL確認: `https://rpo-saas-backend.vercel.app`

---

## 3. データベース初期化 (3分)

ローカルで実行:

```bash
cd /Users/momozaki/dev/rpo-saas/backend

# .env ファイル作成
echo "DATABASE_URL=<VercelのPOSTGRES_PRISMA_URL>" > .env

# スキーマ作成
npx prisma db push

# サンプルデータ投入
npm run prisma:seed
```

- [ ] スキーマ作成完了
- [ ] シードデータ投入完了

---

## 4. フロントエンド (3分)

- [ ] Vercel → Add New → Project
- [ ] リポジトリ: `rpo-saas` を選択 (同じリポジトリ)
- [ ] プロジェクト名: `rpo-saas-frontend`
- [ ] Root Directory: `frontend`
- [ ] Framework: `Next.js` (自動検出)

### 環境変数

- [ ] `NEXT_PUBLIC_API_URL` = `https://rpo-saas-backend.vercel.app`

- [ ] Deploy をクリック
- [ ] デプロイURL確認: `https://rpo-saas-frontend.vercel.app`

---

## 5. 最終調整 (2分)

### バックエンドの FRONTEND_URL を更新

- [ ] バックエンドプロジェクト → Settings → Environment Variables
- [ ] `FRONTEND_URL` = `https://rpo-saas-frontend.vercel.app`
- [ ] Save → Redeploy

---

## 6. 動作確認 ✨

- [ ] API: https://rpo-saas-backend.vercel.app/api/docs
  → Swagger UI が表示される

- [ ] フロントエンド: https://rpo-saas-frontend.vercel.app
  → ログイン画面が表示される

- [ ] ログインテスト:
  - Email: `admin@demo.com`
  - Password: `password123`
  → ダッシュボードが表示される

---

## 🎉 完了！

### デプロイ済みURL

- **フロントエンド**: https://rpo-saas-frontend.vercel.app
- **API**: https://rpo-saas-backend.vercel.app/api/docs

### 所要時間: 約20分

---

## トラブルシューティング

### ❌ バックエンドが起動しない
→ Vercel → プロジェクト → Deployments → Function Logs を確認

### ❌ データベース接続エラー
→ 環境変数 `DATABASE_URL` が正しいか確認
→ Storage タブでデータベースが接続されているか確認

### ❌ CORS エラー
→ バックエンドの `FRONTEND_URL` が正しいか確認
→ 両方のプロジェクトを Redeploy

### ❌ ログインできない
→ シードデータが投入されているか確認
→ `npm run prisma:seed` を実行

---

詳細は **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** を参照してください。
