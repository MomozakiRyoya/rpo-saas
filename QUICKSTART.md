# 🚀 クイックスタートガイド

## 今すぐデプロイを開始

### 1. GitHubにコードをプッシュ (5分)

```bash
cd /Users/momozaki/dev/rpo-saas

# Gitの初期化
git init
git add .
git commit -m "🎉 Initial commit: RPO-SaaS MVP"

# GitHubで新しいリポジトリを作成
# https://github.com/new
# リポジトリ名: rpo-saas

# プッシュ
git remote add origin https://github.com/YOUR_USERNAME/rpo-saas.git
git branch -M main
git push -u origin main
```

---

### 2. Railway でバックエンドをデプロイ (10分)

#### a) アカウント作成
https://railway.app → GitHubでサインアップ

#### b) PostgreSQLを追加
1. 「New Project」
2. 「Provision PostgreSQL」をクリック

#### c) バックエンドサービスを追加
1. 「New Service」→「GitHub Repo」
2. `rpo-saas` を選択
3. **Settings** → **Service** → Root Directory: `backend`

#### d) 環境変数を設定
「Variables」タブで追加:

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | PostgreSQLの接続URL (自動設定済み) |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` で生成 |
| `REDIS_HOST` | `containers.internal` (後で設定) |
| `REDIS_PORT` | `6379` |
| `PORT` | `3001` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (後で更新) |
| `NODE_ENV` | `production` |

#### e) Redisを追加 (オプション)
1. 「New Service」→「Redis」
2. REDIS_HOST を更新

#### f) デプロイURL確認
Settings → Networking → 「Generate Domain」

例: `https://rpo-saas-backend-production.up.railway.app`

---

### 3. Vercel でフロントエンドをデプロイ (5分)

#### a) アカウント作成
https://vercel.com → GitHubでサインアップ

#### b) プロジェクトをインポート
1. 「Add New」→「Project」
2. `rpo-saas` リポジトリを選択
3. **Root Directory**: `frontend`

#### c) 環境変数を設定

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | Railway のバックエンドURL |

例: `https://rpo-saas-backend-production.up.railway.app`

#### d) デプロイ
「Deploy」をクリック

#### e) URLを確認
デプロイ完了後、URLが表示されます

例: `https://rpo-saas.vercel.app`

---

### 4. Railway の FRONTEND_URL を更新

RailwayのVariablesに戻って更新:
```
FRONTEND_URL=https://rpo-saas.vercel.app
```

---

### 5. シードデータを投入

Railwayのプロジェクト → バックエンドサービス → **Deployments** → 最新のデプロイ → **View Logs**

コンソールで:
```bash
npm run prisma:seed
```

---

## ✅ 完了！

### アクセスURL
- **フロントエンド**: https://rpo-saas.vercel.app
- **API**: https://rpo-saas-backend-production.up.railway.app/api/docs

### テストログイン
```
Email: admin@demo.com
Password: password123
```

---

## 次のステップ

1. カスタムドメインを設定
2. 本番用の環境変数を更新
3. OpenAI/Claude APIキーを追加して生成機能を有効化
4. メール送信サービス (SendGrid等) を統合

---

## 💰 コスト見積もり

### 無料枠で運用可能
- **Railway**: $5/月の無料クレジット (小規模なら十分)
- **Vercel**: Hobbyプラン無料 (個人利用)
- **合計**: 月額 $0-5 で運用開始可能

### 本格運用時
- **Railway**: $10-20/月
- **Vercel Pro**: $20/月 (チーム利用時)
- **合計**: 月額 $30-40

---

詳細は `DEPLOYMENT.md` を参照してください。
