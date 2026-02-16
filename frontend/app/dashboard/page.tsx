'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8 p-6 sm:p-8 lg:p-12">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,.1) 0%, transparent 50%)',
        }}></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight leading-tight">
            おかえりなさい、{user?.name}さん 👋
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 font-medium">
            {user?.tenantName}
          </p>
          <div className="mt-4 sm:mt-6 flex items-center space-x-2">
            <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-white/90 font-medium">システム稼働中</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* 顧客企業カード */}
        <a
          href="/dashboard/customers"
          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl min-h-[140px] sm:min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 group-hover:from-white/10 group-hover:to-white/20 transition-all duration-300"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider mb-1">顧客企業</p>
              <p className="text-3xl sm:text-4xl font-black text-white mb-1 sm:mb-2">-</p>
              <p className="text-xs sm:text-sm text-white/80">アクティブ顧客を管理</p>
            </div>
          </div>
        </a>

        {/* 求人カード */}
        <a
          href="/dashboard/jobs"
          className="group relative bg-gradient-to-br from-sky-500 to-blue-600 overflow-hidden shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl min-h-[140px] sm:min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 group-hover:from-white/10 group-hover:to-white/20 transition-all duration-300"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider mb-1">求人</p>
              <p className="text-3xl sm:text-4xl font-black text-white mb-1 sm:mb-2">-</p>
              <p className="text-xs sm:text-sm text-white/80">掲載中の求人を確認</p>
            </div>
          </div>
        </a>

        {/* 承認待ちカード */}
        <a
          href="/dashboard/approvals"
          className="group relative bg-gradient-to-br from-cyan-500 to-blue-600 overflow-hidden shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl min-h-[140px] sm:min-h-[160px] sm:col-span-2 lg:col-span-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 group-hover:from-white/10 group-hover:to-white/20 transition-all duration-300"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider mb-1">承認待ち</p>
              <p className="text-3xl sm:text-4xl font-black text-white mb-1 sm:mb-2">-</p>
              <p className="text-xs sm:text-sm text-white/80">レビュー待ちのアイテム</p>
            </div>
          </div>
        </a>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">クイックアクション</h3>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/dashboard/customers/new"
              className="group relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[80px] flex items-center"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform shadow-lg shrink-0">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1 truncate">新規顧客</p>
                  <p className="text-xs text-slate-600 truncate">顧客を追加</p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/jobs/new"
              className="group relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-sky-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[80px] flex items-center"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform shadow-lg shrink-0">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1 truncate">新規求人</p>
                  <p className="text-xs text-slate-600 truncate">求人を作成</p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/analytics"
              className="group relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[80px] flex items-center"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform shadow-lg shrink-0">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1 truncate">分析</p>
                  <p className="text-xs text-slate-600 truncate">パフォーマンス</p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/connectors"
              className="group relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[80px] flex items-center"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform shadow-lg shrink-0">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1 truncate">コネクタ</p>
                  <p className="text-xs text-slate-600 truncate">API設定</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 最近のアクティビティ */}
        <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-3 sm:py-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              最近のアクティビティ
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">求人作成</p>
                  <p className="text-xs text-gray-500">最近のアクティビティはありません</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* システム情報 */}
        <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 sm:px-6 py-3 sm:py-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              システム情報
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-cyan-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">API接続</span>
                <span className="flex items-center text-xs sm:text-sm font-semibold text-cyan-600 shrink-0 ml-2">
                  <span className="h-2 w-2 bg-cyan-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">データベース</span>
                <span className="flex items-center text-xs sm:text-sm font-semibold text-blue-600 shrink-0 ml-2">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                  接続中
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-sky-50 rounded-lg">
                <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">バックグラウンドジョブ</span>
                <span className="flex items-center text-xs sm:text-sm font-semibold text-sky-600 shrink-0 ml-2">
                  <span className="h-2 w-2 bg-sky-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                  実行中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
