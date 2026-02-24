'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAdmin()) {
      router.push('/dashboard');
      return;
    }
    router.push('/dashboard/admin/tenants');
  }, [router]);

  return (
    <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">リダイレクト中...</p>
      </div>
    </div>
  );
}
