# RPO-SaaS セットアップガイド

## 🚀 ローカル起動手順

### 1. Docker Desktopの起動

Docker Desktopが起動していることを確認してください。

### 2. サービスの起動

```bash
cd /Users/momozaki/dev/rpo-saas
docker-compose up -d
```

### 3. ログの確認

```bash
docker-compose logs -f
```

サービスが正常に起動するまで待ちます（初回は数分かかる場合があります）。

### 4. DBマイグレーションとシード（初回のみ）

```bash
# Prismaクライアント生成
docker-compose exec backend npm run prisma:generate

# マイグレーション実行
docker-compose exec backend npx prisma migrate dev --name init

# サンプルデータ投入
docker-compose exec backend npm run prisma:seed
```

### 5. 動作確認

ブラウザで以下のURLにアクセス：

- **Frontend:** http://localhost:3000
- **Backend API Documentation (Swagger):** http://localhost:3001/api/docs

### 6. ログイン

Frontend (http://localhost:3000) にアクセスすると、ログイン画面が表示されます。

テストユーザー：
- Email: `admin@demo.com`
- Password: `password123`

## 📋 主要な導線の確認

ログイン後、以下の流れで動作確認できます：

### 1. 顧客作成
1. 「顧客」メニューをクリック
2. 「新規作成」ボタンをクリック
3. 企業名と説明を入力して作成

### 2. 求人作成
1. 「求人」メニューをクリック
2. 「新規作成」ボタンをクリック
3. 顧客を選択し、求人情報を入力して作成

### 3. テキスト・画像生成
1. 作成した求人の「詳細」をクリック
2. 「テキスト生成」ボタンをクリック（モックテキストが生成されます）
3. 「画像生成」ボタンをクリック（ダミー画像URLが生成されます）

### 4. 承認申請
1. 求人詳細画面で「承認申請」ボタンをクリック

### 5. 承認フロー
1. 「承認待ち」メニューをクリック
2. 承認待ちの求人を選択
3. コメントを入力（任意）して「承認」または「差戻し」

## 🛠️ トラブルシューティング

### ポートが既に使用されている

```bash
# 使用中のポートを確認
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# プロセスを終了
kill -9 <PID>
```

### コンテナを完全に再起動

```bash
docker-compose down -v
docker-compose up -d --build
```

### マイグレーションエラー

```bash
docker-compose exec backend npx prisma migrate reset
docker-compose exec backend npm run prisma:seed
```

### フロントエンドが表示されない

1. ブラウザのコンソールでエラーを確認
2. localStorage のクリア（ログイン問題の場合）
3. Backend APIが起動しているか確認: http://localhost:3001/api/docs

### Backendが起動しない

```bash
# ログを確認
docker-compose logs backend

# データベース接続を確認
docker-compose exec backend npx prisma db pull
```

## 📊 Swagger UI でAPIを確認

http://localhost:3001/api/docs にアクセスすると、全APIエンドポイントをブラウザから直接テストできます。

1. 「Authorize」ボタンをクリック
2. ログインAPIで取得したJWTトークンを入力
3. 各エンドポイントを「Try it out」でテスト

## 🧪 テストデータ

Seedを実行すると以下のデータが作成されます：

- **テナント:** デモRPO株式会社
- **ユーザー:** admin@demo.com, manager@demo.com, member@demo.com (すべてpassword123)
- **顧客企業:** 2社
- **求人:** 3件
- **ダミー媒体コネクタ:** 1件
- **分析データ:** 過去7日分のサンプルデータ

## 📝 次のステップ

主導線が実装されているため、以下の流れで動作確認ができます：

1. ログイン
2. 顧客作成
3. 求人作成
4. テキスト・画像生成
5. 承認申請
6. 承認/差戻し

追加機能（問い合わせ、日程調整、分析）は backend APIが実装済みですが、frontend画面はまだ未実装です。

Swagger UI (http://localhost:3001/api/docs) で直接APIをテストできます。
