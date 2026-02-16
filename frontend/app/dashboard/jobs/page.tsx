'use client';

import { useEffect, useState } from 'react';
import { jobService } from '@/lib/services';
import { Job } from '@/types';

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

const statusStyles: Record<string, { gradient: string; text: string; icon: string }> = {
  DRAFT: {
    gradient: 'from-slate-100 to-slate-200',
    text: 'text-slate-700',
    icon: '📝',
  },
  GENERATED: {
    gradient: 'from-blue-100 to-blue-200',
    text: 'text-blue-700',
    icon: '✨',
  },
  PENDING_APPROVAL: {
    gradient: 'from-cyan-100 to-sky-200',
    text: 'text-cyan-700',
    icon: '⏳',
  },
  APPROVED: {
    gradient: 'from-emerald-100 to-emerald-200',
    text: 'text-emerald-700',
    icon: '✅',
  },
  PUBLISHING: {
    gradient: 'from-blue-100 to-cyan-200',
    text: 'text-blue-700',
    icon: '🚀',
  },
  PUBLISHED: {
    gradient: 'from-green-100 to-green-200',
    text: 'text-green-700',
    icon: '🌟',
  },
  PUBLISH_FAILED: {
    gradient: 'from-red-100 to-red-200',
    text: 'text-red-700',
    icon: '❌',
  },
  STOPPED: {
    gradient: 'from-gray-100 to-gray-200',
    text: 'text-gray-700',
    icon: '⏸',
  },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      const response = await jobService.getAll({ status: statusFilter || undefined });
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '求人一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              求人一覧
            </h1>
            <p className="text-sm sm:text-base text-gray-600 flex items-center space-x-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">登録されている求人の一覧です</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <a
              href="/dashboard/jobs/new"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </a>
          </div>
        </div>

        {/* Status Filter and View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <label htmlFor="status" className="text-sm font-bold text-gray-700 flex items-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              フィルタ
            </label>
            <select
              id="status"
              name="status"
              className="block w-full sm:w-auto px-4 py-2.5 text-sm font-medium border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white min-h-[44px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">すべて表示</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 font-medium mr-2">表示形式:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="ml-2 hidden sm:inline text-sm font-semibold">グリッド</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="ml-2 hidden sm:inline text-sm font-semibold">リスト</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base text-red-800 font-medium break-words">{error}</span>
          </div>
        </div>
      )}

      {/* Job Cards Grid */}
      {jobs.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">求人が登録されていません</h3>
          <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">最初の求人を作成しましょう</p>
          <a
            href="/dashboard/jobs/new"
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規求人を作成
          </a>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {jobs.map((job, index) => {
            const statusStyle = statusStyles[job.status] || statusStyles.DRAFT;
            return (
              <a
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 transform hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Card Header with Status */}
                <div className="relative p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative z-10 flex items-start justify-between min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs mb-2 sm:mb-3 bg-gradient-to-r ${statusStyle.gradient} ${statusStyle.text}`}>
                        <span className="mr-1">{statusStyle.icon}</span>
                        <span className="truncate">{statusLabels[job.status] || job.status}</span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-white mb-2 line-clamp-2 group-hover:scale-105 transition-transform origin-left">
                        {job.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="space-y-2 sm:space-y-3 mb-4">
                    {/* Customer */}
                    <div className="flex items-center text-sm min-w-0">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">顧客企業</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{job.customer?.name || '未設定'}</p>
                      </div>
                    </div>

                    {/* Updated Date */}
                    <div className="flex items-center text-sm min-w-0">
                      <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">最終更新</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {new Date(job.updatedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* View Details Link */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700 flex items-center">
                      詳細を見る
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {jobs.map((job, index) => {
            const statusStyle = statusStyles[job.status] || statusStyles.DRAFT;
            return (
              <a
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 block"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* List Item Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 sm:p-6 sm:w-48 lg:w-56 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    <div className="relative z-10 flex sm:flex-col items-center sm:items-start space-x-2 sm:space-x-0 sm:space-y-3 w-full">
                      <div className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs bg-gradient-to-r ${statusStyle.gradient} ${statusStyle.text}`}>
                        <span className="mr-1">{statusStyle.icon}</span>
                        <span className="truncate">{statusLabels[job.status] || job.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* List Item Body */}
                  <div className="flex-1 p-4 sm:p-6 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2 sm:mb-0">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-blue-600 font-bold text-sm flex-shrink-0">
                        詳細を見る
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-100">
                      {/* Customer */}
                      <div className="flex items-center text-sm min-w-0">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg mr-2 flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 font-medium">顧客企業</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{job.customer?.name || '未設定'}</p>
                        </div>
                      </div>

                      {/* Updated Date */}
                      <div className="flex items-center text-sm min-w-0">
                        <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-lg mr-2 flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 font-medium">最終更新</p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {new Date(job.updatedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
