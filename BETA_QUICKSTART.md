# ベータ版クイックスタートガイド

## 必要なAPIキーの取得（5-10分）

### 1. Anthropic API Key（Claude - テキスト生成用）
```
1. https://console.anthropic.com/ にアクセス
2. サインアップ/ログイン
3. 左メニュー「API Keys」→「Create Key」
4. キーをコピー → ANTHROPIC_API_KEY に設定
```

### 2. Resend API Key（メール送信用）
```
1. https://resend.com/ にアクセス
2. サインアップ/ログイン
3. 「API Keys」→「Create API Key」
4. キーをコピー → RESEND_API_KEY に設定
```

### 3. Redis（BullMQ用）
```
Railway推奨:
1. Railwayダッシュボード → プロジェクト
2. 「New」→「Database」→「Add Redis」
3. 接続情報を環境変数に設定
```

---

## デプロイ（5分）

### Railwayに環境変数を追加

```bash
# Railwayダッシュボード → Variables タブ

ANTHROPIC_API_KEY=sk-ant-xxxxx
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
JWT_SECRET=your-random-secret-key-here
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 再デプロイ

環境変数を追加したら、Railwayが自動で再デプロイされます。

---

## 初回セットアップ（5分）

### 1. データベース初期化（既に完了済みの場合スキップ）

Railwayコンソールで：
```bash
npx prisma db push
npm run prisma:seed
```

### 2. 動作確認

フロントエンドURLにアクセス：
```
https://your-frontend.vercel.app/login

デフォルトログイン:
メール: admin@example.com
パスワード: admin123
```

---

## ベータテスト手順

### Day 1: 基本機能確認
```
1. ログイン
2. 顧客企業を作成
3. 求人を作成
4. テキスト生成を実行（Claude API確認）
5. 画像生成を実行（Gemini API確認）
```

### Day 2: コネクタ設定
```
1. ダッシュボード → コネクタ設定
2. ダミーコネクタを追加
3. 接続テストを実行
4. 求人を掲載（ダミー）
```

### Day 3: 承認フロー確認
```
1. 求人のテキスト・画像を生成
2. 承認申請
3. 承認フロー確認
4. 承認後に掲載
```

### Day 4-7: 実運用テスト
```
1. 実際の顧客データで求人作成
2. 問い合わせ対応フロー確認
3. 日程調整機能確認
4. エラーログ確認
```

---

## よくある問題と解決方法

### Q: テキスト生成が「キューに追加されました」で止まる
A: Redisの接続確認。Railwayログで"Redis connection"を検索

### Q: メールが送信されない
A: Resend API Keyを確認。無料プランの場合、送信先が制限されている可能性

### Q: コネクタ接続テストが失敗
A: ダミーコネクタの場合は常に成功するはず。他のコネクタはAPI認証情報を確認

### Q: 画像が表示されない
A: 画像はバックエンドの`public/images`に保存。Railwayの静的ファイル配信を確認

---

## 緊急連絡先・サポート

エラーが発生した場合：
1. Railwayログを確認（Deploy → Logs）
2. Vercelログを確認（Deployments → Logs）
3. エラー内容をスクリーンショット
4. [担当者連絡先]

---

## フィードバック収集

ベータテスト中に以下を記録：
- [ ] どの機能を使ったか
- [ ] エラーが発生したか（スクリーンショット）
- [ ] UI/UXで改善してほしい点
- [ ] 追加してほしい機能
- [ ] パフォーマンス（遅いと感じた操作）

