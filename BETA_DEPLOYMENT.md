# ベータ運用デプロイメントガイド

## 前提条件

以下のサービスアカウント/APIキーが必要です：

### 必須
- ✅ PostgreSQL データベース（Railway提供済み）
- ✅ Redis サーバー（BullMQ用）
- ⚠️ Anthropic API Key（Claude API）
- ⚠️ Resend API Key（メール送信）
- ✅ Gemini API Key（画像生成）

### オプション（実媒体連携時）
- Indeed API Key + Publisher ID
- 求人ボックス API Key + Company ID

---

## 1. 環境変数の設定

### バックエンド（Railway）

Railwayダッシュボードで以下の環境変数を設定：

```bash
# データベース（既に設定済み）
DATABASE_URL=postgresql://postgres:...

# JWT認証
JWT_SECRET=your-super-secret-jwt-key-change-this

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# LLM API
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...

# メール送信
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# アプリ設定
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### フロントエンド（Vercel）

Vercelダッシュボードで以下を設定：

```bash
NEXT_PUBLIC_API_URL=https://rpo-saas-backend-production-84a8.up.railway.app
```

---

## 2. Redis のセットアップ

### オプションA: Railway Redisプラグイン（推奨）
1. Railwayダッシュボード → プロジェクト選択
2. 「New」→「Database」→「Add Redis」
3. 自動で`REDIS_URL`が設定される
4. 環境変数を分解：
   - `REDIS_HOST`: redisのホスト
   - `REDIS_PORT`: 6379
   - `REDIS_PASSWORD`: パスワード

### オプションB: Upstash Redis（無料枠あり）
1. https://upstash.com/ でアカウント作成
2. Redis データベース作成
3. 接続情報をコピーして環境変数に設定

---

## 3. APIキーの取得

### Anthropic API（Claude）
1. https://console.anthropic.com/ でアカウント作成
2. API Keys → Create Key
3. `ANTHROPIC_API_KEY`に設定

### Resend（メール送信）
1. https://resend.com/ でアカウント作成
2. API Keys → Create API Key
3. `RESEND_API_KEY`に設定
4. ドメイン認証（オプション、なくてもテスト可能）

---

## 4. データベースの初期化

Railwayで実行（既に完了済み）：

```bash
npx prisma db push
npm run prisma:seed
```

---

## 5. デプロイ

### バックエンド（Railway）
```bash
# 自動デプロイ設定済み（GitHubプッシュで自動）
git push origin main
```

### フロントエンド（Vercel）
```bash
# 自動デプロイ設定済み（GitHubプッシュで自動）
git push origin main
```

---

## 6. 動作確認

### 基本機能テスト
1. ログイン: https://your-frontend.vercel.app/login
2. 顧客作成
3. 求人作成
4. テキスト生成（Claude API確認）
5. 画像生成（Gemini API確認）
6. コネクタ設定（ダミーコネクタで接続テスト）

### メール送信テスト
1. 問い合わせ作成
2. 自動返信生成
3. メール送信実行
4. 受信確認

---

## 7. ベータテスト顧客の招待

### 初期アカウント作成
```bash
# バックエンドコンテナで実行
npm run prisma:studio

# または直接SQL実行
# User, Tenantテーブルにデータ追加
```

### テスト顧客への案内
- ログインURL: https://your-frontend.vercel.app/login
- テストアカウント情報を共有
- フィードバックフォーム準備

---

## 8. 監視とログ確認

### Railway（バックエンド）
- Deployments → Logs で確認
- エラーログを監視

### Vercel（フロントエンド）
- Deployments → Function Logs で確認

### BullMQジョブ監視
現在はログのみ。将来的にBull Boardを追加推奨。

---

## 9. ベータ運用中の注意事項

### セキュリティ
- ⚠️ API Keyは平文でDB保存（暗号化は次フェーズ）
- ベータ顧客には信頼できる企業のみ招待
- 本番APIキーは使用せず、テスト用APIキーを使用

### データ
- 定期的にPostgreSQLバックアップ
- 重要データは別途エクスポート

### API制限
- Claude API: 使用量を監視
- Gemini API: 使用量を監視
- Resend: 無料枠の制限に注意

---

## トラブルシューティング

### ジョブが実行されない
→ Redisの接続確認、BullMQ Workerのログ確認

### メールが送信されない
→ Resend API Keyの確認、送信元メールアドレスの確認

### LLM生成が失敗
→ API Keyの確認、API制限チェック

---

## 次のステップ（本番運用に向けて）

- [ ] API Key暗号化
- [ ] エラートラッキング（Sentry）
- [ ] APM導入
- [ ] ユニットテスト追加
- [ ] Bull Board（ジョブ監視UI）
- [ ] レート制限
- [ ] 監査ログ

