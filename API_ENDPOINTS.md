# RPO-SaaS MVP API エンドポイント一覧

## 認証
- `POST /api/auth/login` - ログイン（JWT発行）
- `POST /api/auth/register` - ユーザー登録
- `GET /api/auth/me` - 現在のユーザー情報

## テナント管理
- `GET /api/tenants/:id` - テナント情報取得
- `PATCH /api/tenants/:id` - テナント情報更新

## 顧客企業管理
- `GET /api/customers` - 顧客一覧取得（ページネーション）
- `POST /api/customers` - 顧客作成
- `GET /api/customers/:id` - 顧客詳細取得
- `PATCH /api/customers/:id` - 顧客更新
- `DELETE /api/customers/:id` - 顧客削除

## 求人管理
- `GET /api/jobs` - 求人一覧取得（フィルタ: status, customerId）
- `POST /api/jobs` - 求人作成
- `GET /api/jobs/:id` - 求人詳細取得
- `PATCH /api/jobs/:id` - 求人更新
- `DELETE /api/jobs/:id` - 求人削除
- `POST /api/jobs/:id/submit-for-approval` - 承認申請

## テキスト・画像生成
- `POST /api/generation/text` - テキスト生成実行
  - Body: `{ jobId, prompt? }`
  - Response: `{ versionId, content }`
- `POST /api/generation/image` - 画像生成実行
  - Body: `{ jobId, prompt? }`
  - Response: `{ versionId, imageUrl }`
- `GET /api/jobs/:id/text-versions` - テキストバージョン履歴取得
- `GET /api/jobs/:id/image-versions` - 画像バージョン履歴取得
- `GET /api/jobs/:id/diff/:v1/:v2` - バージョン差分取得

## 承認フロー
- `GET /api/approvals` - 承認待ち一覧取得
- `GET /api/approvals/:id` - 承認詳細取得
- `POST /api/approvals/:id/approve` - 承認実行
  - Body: `{ comment? }`
- `POST /api/approvals/:id/reject` - 差戻し
  - Body: `{ comment }`

## 媒体連携（コネクタ）
- `GET /api/connectors` - コネクタ一覧取得
- `POST /api/connectors` - コネクタ作成（管理者のみ）
- `GET /api/connectors/:id` - コネクタ詳細取得
- `PATCH /api/connectors/:id` - コネクタ更新

## 掲載管理
- `GET /api/publications` - 掲載一覧取得（フィルタ: jobId, connectorId, status）
- `POST /api/publications` - 掲載作成・実行
  - Body: `{ jobId, connectorId }`
  - Response: `{ publicationId, status }`
- `GET /api/publications/:id` - 掲載詳細・ログ取得
- `POST /api/publications/:id/update` - 掲載更新
- `POST /api/publications/:id/stop` - 掲載停止
- `POST /api/publications/:id/retry` - 掲載リトライ

## 問い合わせ対応
- `GET /api/inquiries` - 問い合わせ一覧取得
- `POST /api/inquiries` - 問い合わせ登録
  - Body: `{ jobId?, content, applicantName?, applicantEmail? }`
- `GET /api/inquiries/:id` - 問い合わせ詳細取得
- `POST /api/inquiries/:id/classify` - 自動分類実行
- `POST /api/inquiries/:id/generate-response` - 返信案生成
  - Response: `{ responseId, content }`
- `GET /api/inquiries/:id/responses` - 返信案一覧取得
- `POST /api/inquiries/:id/send` - 返信送信
  - Body: `{ responseId }`

## 日程調整
- `GET /api/schedules` - 日程調整一覧取得
- `POST /api/schedules` - 日程調整作成（候補日時3つ提示）
  - Body: `{ inquiryId?, candidateName, candidateEmail }`
  - Response: `{ scheduleId, slots: [DateTime, DateTime, DateTime] }`
- `GET /api/schedules/:id` - 日程調整詳細取得
- `POST /api/schedules/:id/confirm` - 日程確定
  - Body: `{ slotId }`
  - Response: `{ externalEventId }`
- `POST /api/schedules/:id/cancel` - 日程キャンセル

## 分析ダッシュボード
- `GET /api/analytics/daily` - 日次指標取得
  - Query: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&jobId=&connectorId=`
  - Response: `{ metrics: [{ date, impressions, clicks, applications, clickRate, applicationRate }] }`
- `GET /api/analytics/summary` - サマリー取得
  - Response: `{ totalJobs, publishedJobs, totalApplications, averageClickRate }`

## 監査ログ
- `GET /api/audit-logs` - 監査ログ取得
  - Query: `?startDate=&endDate=&userId=&action=&resource=`
