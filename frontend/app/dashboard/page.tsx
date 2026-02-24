'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/auth';

const STATS = [
  {
    label: '顧客企業',
    value: '-',
    sub: 'アクティブ顧客',
    href: '/dashboard/customers',
    bgColor: '#EEF2FF',   // indigo-100
    iconColor: '#4F46E5', // indigo-600
    borderColor: '#818CF8',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: '求人',
    value: '-',
    sub: '掲載中の求人',
    href: '/dashboard/jobs',
    bgColor: '#EFF6FF',   // blue-50
    iconColor: '#2563EB', // blue-600
    borderColor: '#60A5FA',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: '承認待ち',
    value: '-',
    sub: 'レビュー待ち',
    href: '/dashboard/approvals',
    bgColor: '#FFF1F2',   // rose-50
    iconColor: '#E11D48', // rose-600
    borderColor: '#FB7185',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: '問い合わせ',
    value: '-',
    sub: '未対応',
    href: '/dashboard/inquiries',
    bgColor: '#ECFDF5',   // emerald-50
    iconColor: '#059669', // emerald-600
    borderColor: '#34D399',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

const QUICK_ACTIONS = [
  {
    href: '/dashboard/customers/new',
    label: '新規顧客を追加',
    desc: '顧客企業を登録',
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/jobs/new',
    label: '求人を作成',
    desc: '新しい求人票を作成',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/analytics',
    label: '分析を見る',
    desc: 'パフォーマンス確認',
    bgColor: '#ECFDF5',
    iconColor: '#059669',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/connectors',
    label: 'APIコネクタ',
    desc: '媒体API設定',
    bgColor: '#FFFBEB',
    iconColor: '#D97706',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const STATUS_ITEMS = [
  { label: 'API接続', status: '正常', color: '#059669', bg: '#ECFDF5' },
  { label: 'データベース', status: '接続中', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'バックグラウンドジョブ', status: '実行中', color: '#D97706', bg: '#FFFBEB' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  return (
    <div className="space-y-6">
      {/* ウェルカムヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          おかえりなさい、{user?.name}さん
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {user?.tenantName} のダッシュボード
        </p>
      </div>

      {/* ステータスバー */}
      <div className="flex flex-wrap gap-3">
        {STATUS_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: item.bg, color: item.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: item.color }}></span>
            <span className="text-gray-600 text-xs hidden sm:inline">{item.label}</span>
            <span className="text-xs font-semibold">{item.status}</span>
          </div>
        ))}
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* アイコン */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: stat.bgColor, color: stat.iconColor }}
            >
              {stat.icon}
            </div>

            {/* 数値 */}
            <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{stat.value}</p>

            {/* ラベル */}
            <p className="text-sm font-semibold text-gray-700 mb-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400">{stat.sub}</p>

            {/* ボトムアクセント */}
            <div
              className="mt-4 h-0.5 w-8 rounded-full transition-all duration-200 group-hover:w-full"
              style={{ backgroundColor: stat.borderColor }}
            ></div>
          </a>
        ))}
      </div>

      {/* クイックアクション + アクティビティ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* クイックアクション */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">クイックアクション</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="group flex items-center space-x-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: action.bgColor, color: action.iconColor }}
                >
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{action.label}</p>
                  <p className="text-xs text-gray-400 truncate">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">最近のアクティビティ</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: '#EEF2FF', color: '#818CF8' }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">アクティビティなし</p>
              <p className="text-xs text-gray-400 mt-1">最近の操作がここに表示されます</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
