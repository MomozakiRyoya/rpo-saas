# 🚀 Vercel のみでデプロイ

## 概要

Vercel で以下をデプロイします:
- **バックエンド API** (NestJS → Vercel Serverless Functions)
- **フロントエンド** (Next.js)
- **データベース** (Vercel Postgres)

---

## ステップ 1️⃣: GitHubにプッシュ

```bash
cd /Users/momozaki/dev/rpo-saas

# 初期化
git init
git add .
git commit -m "🎉 Initial commit: RPO-SaaS MVP"

# GitHubで新規リポジトリ作成: https://github.com/new
# リポジトリ名: rpo-saas

# プッシュ
git remote add origin https://github.com/YOUR_USERNAME/rpo-saas.git
git branch -M main
git push -u origin main
```

---

## ステップ 2️⃣: Vercel Postgresを作成

### 2-1. Vercelにログイン
https://vercel.com にアクセス → GitHubでサインアップ

### 2-2. Storage を追加
1. ダッシュボード → 「Storage」タブ
2. 「Create Database」→ 「Postgres」を選択
3. データベース名: `rpo-saas-db`
4. リージョン: `Washington, D.C., USA (iad1)` (推奨)
5. 「Create」をクリック

### 2-3. 接続情報を確認
「.env.local」タブで環境変数が表示されます:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

これらは後で使用します。

---

## ステップ 3️⃣: バックエンドAPIをデプロイ

### 3-1. 新しいプロジェクトを作成

1. Vercelダッシュボード → 「Add New」→ 「Project」
2. GitHubリポジトリ `rpo-saas` を選択
3. プロジェクト名: `rpo-saas-backend`

### 3-2. ビルド設定

```
Framework Preset: Other
Root Directory: backend
Build Command: npm install && npx prisma generate && npm run build
Output Directory: (空欄)
Install Command: npm install
```

### 3-3. 環境変数を設定

「Environment Variables」で以下を追加:

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | Vercel Postgresの `POSTGRES_PRISMA_URL` をコピー |
| `POSTGRES_PRISMA_URL` | Vercel Postgresの値をコピー |
| `JWT_SECRET` | ランダムな文字列 (下記コマンドで生成) |
| `FRONTEND_URL` | `https://rpo-saas-frontend.vercel.app` (後で更新) |
| `NODE_ENV` | `production` |

**JWT_SECRET 生成:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**重要**: RedisはVercel環境では使用しないため、REDIS関連の環境変数は不要です。

### 3-4. データベース接続

「Settings」→ 「Environment Variables」→ 「Connect Store」
- 先ほど作成した Postgres データベースを選択

### 3-5. デプロイ

「Deploy」をクリック

デプロイ後のURL例:
```
https://rpo-saas-backend.vercel.app
```

### 3-6. データベーススキーマを作成

デプロイが完了したら、Vercelのプロジェクト → 「Settings」→ 「Functions」でコマンドを実行:

または、ローカルから:
```bash
# .env ファイルを更新
echo "DATABASE_URL=<Vercel PostgresのURL>" > backend/.env

# スキーマをプッシュ
cd backend
npx prisma db push

# シードデータ投入
npx prisma db seed
```

---

## ステップ 4️⃣: フロントエンドをデプロイ

### 4-1. 新しいプロジェクトを作成

1. Vercelダッシュボード → 「Add New」→ 「Project」
2. 同じGitHubリポジトリ `rpo-saas` を選択
3. プロジェクト名: `rpo-saas-frontend`

### 4-2. ビルド設定

```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build (自動設定)
Output Directory: .next (自動設定)
Install Command: npm install
```

### 4-3. 環境変数を設定

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | `https://rpo-saas-backend.vercel.app` |

バックエンドのURLを正確に入力してください。

### 4-4. デプロイ

「Deploy」をクリック

デプロイ後のURL例:
```
https://rpo-saas-frontend.vercel.app
```

---

## ステップ 5️⃣: 環境変数の最終調整

### バックエンドの FRONTEND_URL を更新

1. バックエンドプロジェクト → 「Settings」→ 「Environment Variables」
2. `FRONTEND_URL` を更新:
   ```
   https://rpo-saas-frontend.vercel.app
   ```
3. 「Save」→ 「Redeploy」

---

## ステップ 6️⃣: 動作確認

### バックエンドAPI
```
https://rpo-saas-backend.vercel.app/api/docs
```
→ Swagger UIが表示されればOK

### フロントエンド
```
https://rpo-saas-frontend.vercel.app
```
→ ログイン画面が表示されればOK

### テストログイン
```
Email: admin@demo.com
Password: password123
```

---

## 🎉 完了！

以下のURLでアクセスできます:

- **フロントエンド**: https://rpo-saas-frontend.vercel.app
- **API**: https://rpo-saas-backend.vercel.app
- **API Docs**: https://rpo-saas-backend.vercel.app/api/docs

---

## 📝 重要な注意事項

### Vercel の制限

1. **Serverless Function タイムアウト**
   - Hobby: 10秒
   - Pro: 60秒
   - 長時間の処理には不向き

2. **コールドスタート**
   - 最初のリクエストは遅い (5-10秒)
   - アクセスがない場合、関数がスリープ

3. **データベース接続**
   - 接続プーリングが重要
   - Vercel Postgres は接続数制限あり

### Redis / BullMQ について

Vercel環境ではRedisを簡単に使用できないため:
- バックグラウンドジョブは一旦無効化
- 必要な場合は Upstash Redis を使用 (別途設定)

---

## 💰 コスト

### Vercel Hobby (無料)
- ✅ 個人プロジェクト
- ✅ 月100GBまでのバンドwidth
- ✅ Serverless Functions 実行時間: 100時間/月
- ❌ 商用利用不可

### Vercel Pro ($20/月)
- ✅ 商用利用可能
- ✅ より長いタイムアウト
- ✅ より多いリソース

### Vercel Postgres
- Hobby: 256MB / 60時間 compute (無料)
- Pro: 512MB〜 ($20/月〜)

---

## トラブルシューティング

### バックエンドが起動しない
→ Vercelのログを確認: プロジェクト → 「Deployments」→ 最新のデプロイ → 「Function Logs」

### データベース接続エラー
→ 環境変数 `POSTGRES_PRISMA_URL` が正しく設定されているか確認
→ Vercel Postgresとプロジェクトが接続されているか確認

### CORS エラー
→ バックエンドの `FRONTEND_URL` が正しいか確認
→ フロントエンドの `NEXT_PUBLIC_API_URL` が正しいか確認

### Prisma エラー
→ `npx prisma generate` がビルド時に実行されているか確認
→ ローカルで `prisma db push` を実行してスキーマを同期

---

## 次のステップ

1. ✅ カスタムドメインを設定
2. ✅ 本番用のシークレットを更新
3. ✅ OpenAI/Claude APIを統合
4. ✅ メール送信機能を追加 (SendGrid等)

詳細はVercelの公式ドキュメントを参照:
https://vercel.com/docs
