'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PortalApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/portal/approvals');
      setApprovals(res.data);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    setSubmitting(true);
    try {
      await api.post(`/api/portal/approvals/${approvalId}/approve`);
      toast.success('求人を承認しました');
      loadApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '承認に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTargetId || !rejectComment.trim()) {
      toast.error('差し戻し理由を入力してください');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/portal/approvals/${rejectTargetId}/reject`, {
        comment: rejectComment,
      });
      toast.success('求人を差し戻しました');
      setRejectTargetId(null);
      setRejectComment('');
      loadApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '差し戻しに失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">承認</h2>
        <p className="text-sm text-gray-500 mt-0.5">承認待ちの求人を確認して対応してください</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 bg-emerald-50">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">承認待ちはありません</h3>
          <p className="text-sm text-gray-500">現在、対応が必要な求人はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        承認待ち
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {approval.job?.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      申請日: {new Date(approval.requestedAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>

                  {rejectTargetId !== approval.id && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={`/portal/jobs/${approval.job?.id}`}
                        className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-xl transition-colors"
                      >
                        詳細を見る
                      </a>
                      <button
                        onClick={() => setRejectTargetId(approval.id)}
                        disabled={submitting}
                        className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        差し戻し
                      </button>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={submitting}
                        className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        {submitting ? '処理中...' : '承認'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 差し戻しフォーム */}
                {rejectTargetId === approval.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      差し戻し理由（必須）
                    </label>
                    <textarea
                      rows={3}
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="差し戻す理由を具体的に入力してください..."
                      className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-none"
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={handleReject}
                        disabled={submitting}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        {submitting ? '処理中...' : '差し戻しを実行'}
                      </button>
                      <button
                        onClick={() => { setRejectTargetId(null); setRejectComment(''); }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium rounded-xl transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
