'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { approvalService } from '@/lib/services';
import { Approval } from '@/types';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const response = await approvalService.getAll();
      setApprovals(response.data.filter(a => a.status === 'PENDING'));
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setActionLoading(true);
    try {
      await approvalService.approve(selectedApproval.id, comment);
      toast.success('承認が完了しました');
      setSelectedApproval(null);
      setComment('');
      loadApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '承認に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !comment) {
      toast.error('差戻しの理由を入力してください');
      return;
    }
    setActionLoading(true);
    try {
      await approvalService.reject(selectedApproval.id, comment);
      toast.success('差戻しが完了しました');
      setSelectedApproval(null);
      setComment('');
      loadApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '差戻しに失敗しました');
    } finally {
      setActionLoading(false);
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          承認待ち一覧
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <p className="text-sm sm:text-base text-gray-600 flex items-center space-x-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate">レビュー待ちの求人を確認して承認または差戻しを行います</span>
          </p>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 font-medium mr-2">表示形式:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg'
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
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg'
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

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Approvals List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center min-w-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="truncate">承認待ちリスト</span>
                </h3>
                <span className="bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-bold flex-shrink-0 ml-2">
                  {approvals.length} 件
                </span>
              </div>
            </div>
            <ul role="list" className={viewMode === 'grid' ? "divide-y divide-slate-100" : "space-y-0"}>
              {approvals.length === 0 ? (
                <li className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 font-medium">承認待ちの求人はありません</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">すべての求人が処理されました</p>
                </li>
              ) : viewMode === 'grid' ? (
                approvals.map((approval, index) => (
                  <li
                    key={approval.id}
                    className={`px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 ${
                      selectedApproval?.id === approval.id
                        ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-l-4 border-sky-500'
                        : ''
                    }`}
                    onClick={() => setSelectedApproval(approval)}
                    style={{
                      animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                          <div className="bg-gradient-to-br from-sky-100 to-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">
                              {approval.job?.title}
                            </p>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {approval.job?.customer?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4 flex flex-col items-end space-y-1 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-100 to-sky-100 text-cyan-700">
                          <span className="mr-1">⏳</span>
                          <span className="hidden sm:inline">承認待ち</span>
                        </span>
                        <p className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(approval.requestedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                approvals.map((approval, index) => (
                  <li
                    key={approval.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedApproval?.id === approval.id
                        ? 'bg-gradient-to-r from-sky-50 to-blue-50'
                        : 'hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50'
                    } ${index > 0 ? 'border-t border-slate-100' : ''}`}
                    onClick={() => setSelectedApproval(approval)}
                    style={{
                      animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* List Item Header */}
                      <div className={`bg-gradient-to-r from-sky-500 to-blue-500 p-4 sm:p-6 sm:w-48 lg:w-56 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center relative overflow-hidden ${
                        selectedApproval?.id === approval.id ? 'border-l-4 border-sky-600' : ''
                      }`}>
                        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity"></div>
                        <div className="relative z-10 bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl mb-0 sm:mb-3">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="relative z-10 bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full">
                          <span className="text-white text-xs sm:text-sm font-bold whitespace-nowrap">⏳ 承認待ち</span>
                        </div>
                      </div>

                      {/* List Item Body */}
                      <div className="flex-1 p-4 sm:p-6 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 hover:text-sky-600 transition-colors truncate mb-2 sm:mb-0">
                            {approval.job?.title}
                          </h3>
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
                              <p className="text-sm font-bold text-slate-900 truncate">{approval.job?.customer?.name}</p>
                            </div>
                          </div>

                          {/* Request Date */}
                          <div className="flex items-center text-sm min-w-0">
                            <div className="bg-cyan-100 p-1.5 sm:p-2 rounded-lg mr-2 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500 font-medium">申請日</p>
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {new Date(approval.requestedAt).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Approval Detail Panel */}
        {selectedApproval ? (
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 sticky top-4 lg:top-6">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="truncate">承認詳細</span>
                </h3>
              </div>
              <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    求人タイトル
                  </label>
                  <p className="text-sm font-black text-slate-900 break-words">
                    {selectedApproval.job?.title}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    顧客企業
                  </label>
                  <p className="text-sm font-black text-slate-900 break-words">
                    {selectedApproval.job?.customer?.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    コメント（任意）
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="承認または差戻しのコメントを入力..."
                  />
                </div>
                <div className="flex flex-col space-y-2 sm:space-y-3 pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-4 h-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        処理中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        承認する
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-4 h-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        処理中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        差戻す
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">求人を選択してください</h3>
              <p className="text-xs text-slate-500">左側から承認する求人をクリックします</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
