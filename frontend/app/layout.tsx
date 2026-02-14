import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RPO-SaaS MVP',
  description: 'RPO会社向けSaaS管理画面',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
