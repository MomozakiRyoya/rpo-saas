'use client';

import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      ? 'relative px-3 py-2 text-sm font-bold text-indigo-600 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600 after:rounded-full'
      : 'px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors';
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <a href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RPO-SaaS
              </h1>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
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
                承認
              </a>
              <a href="/dashboard/inquiries" className={getLinkClass('/dashboard/inquiries')}>
                問合せ
              </a>
              <a href="/dashboard/schedules" className={getLinkClass('/dashboard/schedules')}>
                日程
              </a>
              <a href="/dashboard/analytics" className={getLinkClass('/dashboard/analytics')}>
                分析
              </a>
              <a href="/dashboard/connectors" className={getLinkClass('/dashboard/connectors')}>
                API
              </a>
              <a href="/dashboard/settings" className={getLinkClass('/dashboard/settings')}>
                設定
              </a>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all shadow-sm hover:shadow"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  ログアウト
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <a
              href="/dashboard"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              ホーム
            </a>
            <a
              href="/dashboard/customers"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/customers')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              顧客
            </a>
            <a
              href="/dashboard/jobs"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/jobs')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              求人
            </a>
            <a
              href="/dashboard/approvals"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/approvals')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              承認待ち
            </a>
            <a
              href="/dashboard/inquiries"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/inquiries')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              問い合わせ
            </a>
            <a
              href="/dashboard/schedules"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/schedules')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              日程調整
            </a>
            <a
              href="/dashboard/analytics"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/analytics')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              分析
            </a>
            <a
              href="/dashboard/connectors"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/connectors')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              コネクタ設定
            </a>
            <a
              href="/dashboard/settings"
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/dashboard/settings')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              システム設定
            </a>

            {/* Mobile User Section */}
            {user && (
              <div className="pt-4 border-t border-slate-200 mt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:from-slate-200 hover:to-slate-300 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
