'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user?.role === 'CUSTOMER') {
        router.push('/portal/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
    // 未認証の場合はランディングページを表示
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4A154B] rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RPO-SaaS</h1>
          <p className="text-gray-500 text-sm">採用プロセスアウトソーシング管理プラットフォーム</p>
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full py-3 px-6 bg-[#4A154B] hover:bg-[#3d1040] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            RPOスタッフとしてログイン
          </a>
          <a
            href="/portal/login"
            className="block w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            採用企業ポータルへ
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          © 2026 RPO-SaaS. All rights reserved.
        </p>
      </div>
    </main>
  );
}
