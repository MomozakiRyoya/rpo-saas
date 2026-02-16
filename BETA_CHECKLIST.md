# ベータ運用開始チェックリスト

## ✅ 完了済み

- [x] 基本機能実装（求人管理、AI生成、承認フロー）
- [x] コネクタ管理UI
- [x] 非同期ジョブ処理（BullMQ）
- [x] データベース（Railway PostgreSQL）
- [x] 環境変数テンプレート作成
- [x] デプロイメントガイド作成
- [x] セキュリティ注意事項ドキュメント

## 🔧 必須: 環境変数の設定

### Railwayで設定が必要な環境変数

現在の`.env`ファイルに追加済みですが、**Railwayダッシュボード**でも設定してください：

#### 1. Anthropic API Key（Claude - テキスト生成）
```
変数名: ANTHROPIC_API_KEY
取得先: https://console.anthropic.com/
状態: ⚠️ 未設定
```

#### 2. Resend API Key（メール送信）
```
変数名: RESEND_API_KEY
取得先: https://resend.com/
状態: ⚠️ 未設定

変数名: RESEND_FROM_EMAIL
値例: noreply@yourdomain.com
```

#### 3. Redis（BullMQ用）
```
オプションA: Railwayで追加
  1. New → Database → Add Redis
  2. 自動で接続情報が設定される
  3. REDIS_HOST, REDIS_PORT, REDIS_PASSWORDを確認

オプションB: Upstash
  1. https://upstash.com/ でRedis作成
  2. 接続情報をコピー
  
状態: ⚠️ 未設定
```

#### 4. その他（既に設定されているもの）
```
✅ DATABASE_URL - 設定済み
✅ GEMINI_API_KEY - 設定済み
✅ JWT_SECRET - ローカル.envに設定済み（Railwayにコピー必要）
```

---

## 📋 ベータ運用開始の手順

### ステップ1: APIキー取得（10分）

1. **Anthropic（Claude）**
   - https://console.anthropic.com/ → API Keys → Create Key
   - 月額上限を設定（例: $20）
   
2. **Resend（メール）**
   - https://resend.com/ → API Keys → Create API Key
   - 無料枠: 100通/日

3. **Redis**
   - Railway: New → Database → Add Redis
   - または Upstash（無料枠あり）

### ステップ2: Railwayに環境変数を設定（5分）

```bash
# Railwayダッシュボード → Variables
ANTHROPIC_API_KEY=sk-ant-xxxxx
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
JWT_SECRET=rpo-saas-jwt-secret-key-beta-2024-change-in-production
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
FRONTEND_URL=https://your-frontend.vercel.app
```

### ステップ3: 再デプロイ（自動）

環境変数を保存すると、Railwayが自動で再デプロイします。

### ステップ4: 動作確認（10分）

1. フロントエンドにアクセス
2. ログイン（admin@example.com / admin123）
3. 求人作成
4. テキスト生成実行 → Claudeが動作確認
5. コネクタ設定 → ダミーコネクタで接続テスト

### ステップ5: ベータ顧客の招待

1. テストアカウント作成
2. 動作確認後、顧客に共有
3. フィードバック収集

---

## 🔍 確認ポイント

### 機能チェック
- [ ] ログインできる
- [ ] 求人作成できる
- [ ] テキスト生成が動作（Claudeから応答）
- [ ] 画像生成が動作（Gemini）
- [ ] コネクタ設定で接続テスト成功
- [ ] メール送信が動作
- [ ] 承認フローが動作

### エラーチェック
- [ ] Railwayログにエラーなし
- [ ] Vercelログにエラーなし
- [ ] BullMQジョブが正常実行

---

## 📞 サポート

問題が発生した場合：
1. Railwayログを確認
2. 環境変数が正しく設定されているか確認
3. APIキーの上限に達していないか確認

---

## 次のステップ

ベータ運用開始後：
- [ ] 1週間のテスト運用
- [ ] フィードバック収集
- [ ] エラーログの監視
- [ ] API使用量の監視
- [ ] セキュリティ強化（本番前）

