'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/services';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// サンプルデータ
const sampleSummary = {
  totalJobs: 24,
  publishedJobs: 18,
  totalApplications: 156,
  averageClickRate: 4.2,
};

const sampleDailyMetrics = [
  {
    date: '2026-02-10',
    impressions: 1250,
    clicks: 58,
    applications: 12,
    clickRate: 4.6,
    applicationRate: 20.7,
  },
  {
    date: '2026-02-11',
    impressions: 1420,
    clicks: 62,
    applications: 15,
    clickRate: 4.4,
    applicationRate: 24.2,
  },
  {
    date: '2026-02-12',
    impressions: 980,
    clicks: 41,
    applications: 8,
    clickRate: 4.2,
    applicationRate: 19.5,
  },
  {
    date: '2026-02-13',
    impressions: 1650,
    clicks: 71,
    applications: 18,
    clickRate: 4.3,
    applicationRate: 25.4,
  },
  {
    date: '2026-02-14',
    impressions: 1880,
    clicks: 79,
    applications: 21,
    clickRate: 4.2,
    applicationRate: 26.6,
  },
  {
    date: '2026-02-15',
    impressions: 1320,
    clicks: 56,
    applications: 14,
    clickRate: 4.2,
    applicationRate: 25.0,
  },
  {
    date: '2026-02-16',
    impressions: 1540,
    clicks: 68,
    applications: 16,
    clickRate: 4.4,
    applicationRate: 23.5,
  },
];

const jobStatusData = [
  { name: '下書き', value: 3, color: '#9ca3af' },
  { name: '生成完了', value: 2, color: '#60a5fa' },
  { name: '承認待ち', value: 1, color: '#fbbf24' },
  { name: '掲載中', value: 18, color: '#34d399' },
];

const connectorPerformance = [
  { name: 'Indeed', applications: 62, clicks: 280, impressions: 5820 },
  { name: '求人ボックス', applications: 48, clicks: 215, impressions: 4560 },
  { name: 'リクナビNEXT', applications: 31, clicks: 165, impressions: 3240 },
  { name: 'マイナビ転職', applications: 15, clicks: 98, impressions: 2180 },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(sampleSummary);
  const [metrics, setMetrics] = useState(sampleDailyMetrics);
  const [loading, setLoading] = useState(false);

  return (
    <div className="px-4 sm:px-0">
      {/* ページタイトル */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">分析ダッシュボード</h2>
        <p className="mt-1 text-sm text-gray-500">求人掲載のパフォーマンスを可視化</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* 総求人数 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">総求人数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalJobs}</p>
        </div>

        {/* 掲載中 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">掲載中</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.publishedJobs}</p>
        </div>

        {/* 総応募数 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">総応募数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalApplications}</p>
        </div>

        {/* 平均クリック率 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">平均クリック率</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.averageClickRate}%</p>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* トレンドグラフ */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">日次パフォーマンス</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="クリック数" />
                <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} name="応募数" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 求人ステータス円グラフ */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">求人ステータス分布</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 媒体別パフォーマンス */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden lg:col-span-2"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">媒体別パフォーマンス</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={connectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#10b981" name="応募数" />
                <Bar dataKey="clicks" fill="#3b82f6" name="クリック数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 詳細テーブル */}
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">日次詳細データ</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  表示数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  クリック数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  応募数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  クリック率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  応募率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {metrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(metric.date).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.applications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {metric.clickRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {metric.applicationRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
