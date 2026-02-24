'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { scorecardService } from '@/lib/services';
import { ScoreCard } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ScorecardDetailPage() {
  const params = useParams<{ id: string }>();
  const scorecardId = params.id;
  const router = useRouter();

  const [scorecard, setScorecard] = useState<ScoreCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadScorecard();
  }, [scorecardId]);

  const loadScorecard = async () => {
    try {
      const data = await scorecardService.getOne(scorecardId);
      setScorecard(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'スコアカードの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このスコアカードを削除しますか？この操作は取り消せません。')) return;
    setDeleting(true);
    try {
      await scorecardService.delete(scorecardId);
      toast.success('スコアカードを削除しました');
      router.push('/dashboard/scorecards');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '削除に失敗しました');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div
          className="bg-white border border-gray-100 rounded-2xl p-16 text-center"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <p className="text-gray-600 font-medium">スコアカードが見つかりませんでした</p>
          <Link
            href="/dashboard/scorecards"
            className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const sortedCriteria = scorecard.criteria
    ? [...scorecard.criteria].sort((a, b) => a.order - b.order)
    : [];

  const totalWeight = sortedCriteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-5">
        <Link
          href="/dashboard/scorecards"
          className="hover:text-indigo-600 transition-colors"
        >
          スコアカード
        </Link>
        <svg
          className="w-4 h-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{scorecard.name}</span>
      </nav>

      {/* Header Card */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-6 mb-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFFBEB' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: '#D97706' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{scorecard.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {scorecard.job && (
                  <span className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-3.5 h-3.5 mr-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {scorecard.job.title}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  作成日: {new Date(scorecard.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {sortedCriteria.length}
              </div>
              <div className="text-xs text-gray-500">評価基準</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{totalWeight}</div>
              <div className="text-xs text-gray-500">総重み</div>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {deleting ? '削除中...' : '削除'}
            </button>
          </div>
        </div>
      </div>

      {/* Criteria Table */}
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">評価基準一覧</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {sortedCriteria.length}項目
          </span>
        </div>

        {sortedCriteria.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-10 h-10 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-gray-500">評価基準が設定されていません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                    順番
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                    評価基準名
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                    重み
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                    最大スコア
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                    重み比率
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCriteria.map((criterion) => {
                  const weightRatio =
                    totalWeight > 0
                      ? ((criterion.weight / totalWeight) * 100).toFixed(1)
                      : '0.0';
                  return (
                    <tr key={criterion.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                        #{criterion.order}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-900">
                          {criterion.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                          {criterion.weight}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 font-medium">
                        {criterion.maxScore}点
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${weightRatio}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">
                            {weightRatio}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-5 py-3" colSpan={2}>
                    <span className="text-xs font-semibold text-gray-600">合計</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold">
                      {totalWeight}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700 font-medium text-xs">
                    {sortedCriteria.reduce((sum, c) => sum + c.maxScore, 0)}点
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-500 font-medium">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
