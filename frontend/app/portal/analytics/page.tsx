'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalApplications: number;
  avgClickRate: number;
}

interface JobMetric {
  jobId: string;
  title: string;
  status: string;
  impressions: number;
  clicks: number;
  applications: number;
  clickRate: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  byJob: JobMetric[];
}

const statusLabels: Record<string, string> = {
  DRAFT: '下書き',
  GENERATED: '生成完了',
  PENDING_APPROVAL: '承認待ち',
  APPROVED: '承認済み',
  PUBLISHED: '掲載中',
  STOPPED: '掲載停止',
};

export default function PortalAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/api/portal/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  const summary = data?.summary;
  const byJob = data?.byJob ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">アナリティクス</h2>
        <p className="text-sm text-gray-500 mt-0.5">自社求人のパフォーマンスを確認できます</p>
      </div>

      {/* サマリー KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'インプレッション', value: summary?.totalImpressions?.toLocaleString() ?? '0', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'blue' },
          { label: 'クリック数', value: summary?.totalClicks?.toLocaleString() ?? '0', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', color: 'teal' },
          { label: '応募数', value: summary?.totalApplications?.toLocaleString() ?? '0', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'emerald' },
          { label: 'クリック率', value: `${summary?.avgClickRate ?? 0}%`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'violet' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-2xl p-5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-${card.color}-50`}>
              <svg className={`w-5 h-5 text-${card.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 求人別テーブル */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">求人別パフォーマンス</h3>
        </div>

        {byJob.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            データがまだありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">求人名</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ステータス</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">インプレッション</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">クリック</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">応募</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {byJob.map((row) => (
                  <tr key={row.jobId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <a
                        href={`/portal/jobs/${row.jobId}`}
                        className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors line-clamp-1"
                      >
                        {row.title}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {statusLabels[row.status] || row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-700">{row.impressions.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-700">{row.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-700">{row.applications.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-700">{row.clickRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
