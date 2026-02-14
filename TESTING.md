# RPO-SaaS テストガイド

## テスト実行方法

### Backendテスト

```bash
cd backend

# ユニットテスト
npm test

# ユニットテスト（watch mode）
npm run test:watch

# カバレッジ付き
npm run test:cov

# E2Eテスト
npm run test:e2e
```

### E2Eテストの詳細

E2Eテストは以下のエンドポイントをテストします：

1. **認証**
   - ユーザー登録
   - ログイン
   - 現在のユーザー取得

2. **顧客管理**
   - 顧客作成
   - 顧客一覧取得
   - 顧客詳細取得

3. **求人管理**
   - 求人作成
   - 求人一覧取得
   - 求人詳細取得

4. **生成機能**
   - テキスト生成
   - 画像生成

5. **承認フロー**
   - 承認申請
   - 承認一覧取得
   - 承認実行

## テストデータ

E2Eテストは独自のテストデータを作成します：

- テナント: `test-company`
- ユーザー: `test@example.com` / `password123`
- 顧客: `Test Customer Inc.`
- 求人: `Software Engineer`

## カバレッジ

現在のカバレッジ目標：

- 主要サービス: 80%以上
- コントローラー: 70%以上
- 全体: 60%以上

## 注意事項

- E2Eテストは実際のデータベースを使用します
- テスト実行前にテスト用DBを用意するか、環境変数を設定してください
- テスト後のクリーンアップは手動で行う必要がある場合があります

## CI/CD統合

GitHub ActionsなどのCI/CDパイプラインでテストを実行する場合：

```yaml
# .github/workflows/test.yml の例
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: cd backend && npm install
      - run: cd backend && npm run test
      - run: cd backend && npm run test:e2e
```
