'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import api from '@/lib/api';

interface PortalUser {
  id: string;
  name: string;
  customerName: string | null;
  customerId: string | null;
}

interface DashboardData {
  totalJobs: number;
  pendingApprovals: number;
  approvedJobs: number;
  publishedJobs: number;
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
  }>;
}

const statusLabels: Record<string, string> = {
  DRAFT: '下書き',
  GENERATED: '生成完了',
  PENDING_APPROVAL: '承認待ち',
  APPROVED: '承認済み',
  PUBLISHING: '掲載実行中',
  PUBLISHED: '掲載中',
  PUBLISH_FAILED: '更新失敗',
  STOPPED: '掲載停止',
};

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  GENERATED: 'bg-gray-100 text-gray-600',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PUBLISHING: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  PUBLISH_FAILED: 'bg-rose-100 text-rose-700',
  STOPPED: 'bg-gray-100 text-gray-600',
};

export default function PortalDashboardPage() {
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meRes, jobsRes] = await Promise.all([
        api.get('/api/portal/me'),
        api.get('/api/portal/jobs'),
      ]);

      const me = meRes.data;
      const jobs = jobsRes.data as any[];

      setPortalUser(me);

      const pendingApprovals = jobs.filter((j) => j.status === 'PENDING_APPROVAL').length;
      const approvedJobs = jobs.filter((j) => j.status === 'APPROVED').length;
      const publishedJobs = jobs.filter((j) => j.status === 'PUBLISHED').length;
      const recentJobs = [...jobs]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

      setDashboardData({
        totalJobs: jobs.length,
        pendingApprovals,
        approvedJobs,
        publishedJobs,
        recentJobs,
      });
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-3 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ウェルカムヘッダー */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          おかえりなさい、{portalUser?.name ?? ''}さん
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {portalUser?.customerName ?? ''} の採用状況
        </p>
      </div>

      {/* 承認待ちアラート */}
      {dashboardData && dashboardData.pendingApprovals > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                承認が必要な求人が {dashboardData.pendingApprovals} 件あります
              </p>
              <p className="text-xs text-amber-600">内容を確認して承認または差し戻しを行ってください</p>
            </div>
          </div>
          <a
            href="/portal/approvals"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors shrink-0 ml-4"
          >
            確認する →
          </a>
        </div>
      )}

      {/* KPI カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: '求人総数', value: dashboardData?.totalJobs ?? 0, color: 'teal', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { label: '承認待ち', value: dashboardData?.pendingApprovals ?? 0, color: 'amber', icon: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: '承認済み', value: dashboardData?.approvedJobs ?? 0, color: 'emerald', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: '掲載中', value: dashboardData?.publishedJobs ?? 0, color: 'blue', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
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

      {/* 最近の求人 */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">最近の求人</h3>
          <a href="/portal/jobs" className="text-xs text-teal-600 hover:text-teal-800 transition-colors">
            すべて見る →
          </a>
        </div>
        <div className="divide-y divide-gray-50">
          {!dashboardData?.recentJobs.length ? (
            <div className="p-8 text-center text-sm text-gray-400">求人がまだありません</div>
          ) : (
            dashboardData.recentJobs.map((job) => (
              <a
                key={job.id}
                href={`/portal/jobs/${job.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(job.updatedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <span
                  className={`ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${statusStyles[job.status] || 'bg-gray-100 text-gray-600'}`}
                >
                  {statusLabels[job.status] || job.status}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
