'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

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

const ALL_STATUSES = ['', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'STOPPED'];

export default function PortalJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/api/portal/jobs', { params });
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">求人一覧</h2>
        <p className="text-sm text-gray-500 mt-0.5">自社の求人をすべて確認できます</p>
      </div>

      {/* ステータスフィルタ */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s ? statusLabels[s] : 'すべて'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gray-50">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">該当する求人がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <a
              key={job.id}
              href={`/portal/jobs/${job.id}`}
              className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 min-w-0 mr-2">
                  {job.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${statusStyles[job.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[job.status] || job.status}
                </span>
              </div>

              {job.location && (
                <div className="flex items-center text-xs text-gray-400 mb-1">
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
              )}

              {job.salary && (
                <div className="flex items-center text-xs text-gray-400 mb-3">
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.salary}
                </div>
              )}

              {job.status === 'PENDING_APPROVAL' && (
                <div className="mt-2 flex items-center text-xs text-amber-600 font-medium">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  承認が必要です
                </div>
              )}

              <div className="flex items-center text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(job.updatedAt).toLocaleDateString('ja-JP')} 更新
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
