import type { Metadata } from "next";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";

export const metadata: Metadata = {
  title: "RPO-SaaS MVP",
  description: "RPO会社向けSaaS管理画面",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
