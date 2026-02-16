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

  const COLORS = ['#9ca3af', '#60a5fa', '#fbbf24', '#34d399'];

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">分析ダッシュボード</h1>
        <p className="text-gray-600">求人掲載のパフォーマンスを可視化</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-transform">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">総求人数</p>
                <p className="text-3xl font-bold text-white mt-2">{summary.totalJobs}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-transform">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">掲載中</p>
                <p className="text-3xl font-bold text-white mt-2">{summary.publishedJobs}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-transform">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">総応募数</p>
                <p className="text-3xl font-bold text-white mt-2">{summary.totalApplications}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden shadow-lg rounded-xl transform hover:scale-105 transition-transform">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">平均クリック率</p>
                <p className="text-3xl font-bold text-white mt-2">{summary.averageClickRate}%</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* トレンドグラフ */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">日次パフォーマンス</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* 求人ステータス円グラフ */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">求人ステータス分布</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* 媒体別パフォーマンス */}
        <div className="bg-white shadow-lg rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">媒体別パフォーマンス</h3>
          <ResponsiveContainer width="100%" height={300}>
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

      {/* 詳細テーブル */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h3 className="text-lg font-semibold text-white">日次詳細データ</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
            <tbody className="bg-white divide-y divide-gray-200">
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
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {metric.clickRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
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
