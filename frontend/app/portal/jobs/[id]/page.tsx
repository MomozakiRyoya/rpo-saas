'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  STOPPED: 'bg-gray-100 text-gray-600',
};

export default function PortalJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) loadJob();
  }, [params.id]);

  const loadJob = async () => {
    try {
      const res = await api.get(`/api/portal/jobs/${params.id}`);
      setJob(res.data);
    } catch (err) {
      console.error('Failed to load job:', err);
      toast.error('求人の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 承認待ちの Approval を取得
  const pendingApproval = job?.approvals?.find((a: any) => a.status === 'PENDING');

  const handleApprove = async () => {
    if (!pendingApproval) return;
    setSubmitting(true);
    try {
      await api.post(`/api/portal/approvals/${pendingApproval.id}/approve`);
      toast.success('求人を承認しました');
      loadJob();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '承認に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!pendingApproval || !rejectComment.trim()) {
      toast.error('差し戻し理由を入力してください');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/portal/approvals/${pendingApproval.id}/reject`, {
        comment: rejectComment,
      });
      toast.success('求人を差し戻しました');
      setShowRejectForm(false);
      setRejectComment('');
      loadJob();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '差し戻しに失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p className="text-sm text-gray-500">求人が見つかりません</p>
        <button onClick={() => router.push('/portal/jobs')} className="mt-4 text-sm text-teal-600 hover:text-teal-800">
          一覧に戻る
        </button>
      </div>
    );
  }

  const latestText = job.textVersions?.[0];
  const latestImage = job.imageVersions?.[0];

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/portal/jobs')}
            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[job.status] || 'bg-gray-100 text-gray-600'}`}>
                {statusLabels[job.status] || job.status}
              </span>
            </div>
          </div>
        </div>

        {/* 承認アクション */}
        {pendingApproval && !showRejectForm && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              差し戻し
            </button>
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? '処理中...' : '承認する'}
            </button>
          </div>
        )}
      </div>

      {/* 承認待ちバナー */}
      {pendingApproval && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">この求人は承認待ちです</p>
              <p className="text-xs text-amber-600 mt-0.5">
                内容を確認して、承認または差し戻しを行ってください。
              </p>
            </div>
          </div>

          {/* 差し戻しフォーム */}
          {showRejectForm && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <label className="block text-sm font-medium text-amber-800 mb-1.5">
                差し戻し理由（必須）
              </label>
              <textarea
                rows={3}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="差し戻す理由を具体的に入力してください..."
                className="w-full border border-amber-300 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none bg-white"
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
                  onClick={() => { setShowRejectForm(false); setRejectComment(''); }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 求人基本情報 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="space-y-3">
              {[
                { label: '勤務地', value: job.location },
                { label: '給与', value: job.salary },
                { label: '雇用形態', value: job.employmentType },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm text-gray-900">{value}</p>
                </div>
              ) : null)}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">登録日</p>
                <p className="text-sm text-gray-900">{new Date(job.createdAt).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
          </div>

          {job.requirements && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">応募要件</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}
        </div>

        {/* 求人コンテンツ */}
        <div className="lg:col-span-2 space-y-4">
          {latestText && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">求人テキスト</h3>
                <span className="text-xs text-gray-400">v{latestText.version} / {latestText.generatedBy === 'ai' ? 'AI生成' : '手動'}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{latestText.content}</p>
            </div>
          )}

          {latestImage && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">求人画像</h3>
              <img
                src={latestImage.imageUrl}
                alt="求人画像"
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

          {job.description && !latestText && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">説明</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
