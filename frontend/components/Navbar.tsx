'use client';

import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    return isActive(path)
      ? 'border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">RPO-SaaS</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="/dashboard" className={getLinkClass('/dashboard')}>
                ホーム
              </a>
              <a href="/dashboard/customers" className={getLinkClass('/dashboard/customers')}>
                顧客
              </a>
              <a href="/dashboard/jobs" className={getLinkClass('/dashboard/jobs')}>
                求人
              </a>
              <a href="/dashboard/approvals" className={getLinkClass('/dashboard/approvals')}>
                承認待ち
              </a>
              <a href="/dashboard/inquiries" className={getLinkClass('/dashboard/inquiries')}>
                問い合わせ
              </a>
              <a href="/dashboard/schedules" className={getLinkClass('/dashboard/schedules')}>
                日程調整
              </a>
              <a href="/dashboard/analytics" className={getLinkClass('/dashboard/analytics')}>
                分析
              </a>
              <a href="/dashboard/connectors" className={getLinkClass('/dashboard/connectors')}>
                コネクタ設定
              </a>
              <a href="/dashboard/settings" className={getLinkClass('/dashboard/settings')}>
                システム設定
              </a>
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
