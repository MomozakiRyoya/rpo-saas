'use client';

import { useEffect, useState } from 'react';
import { scorecardService } from '@/lib/services';
import { ScoreCard } from '@/types';
import toast from 'react-hot-toast';

export default function ScorecardsPage() {
  const [scorecards, setScorecards] = useState<ScoreCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScorecards();
  }, []);

  const loadScorecards = async () => {
    try {
      const data = await scorecardService.getAll();
      setScorecards(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'スコアカードの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await scorecardService.delete(id);
      toast.success('スコアカードを削除しました');
      setScorecards((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mb-6 sm:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">スコアカード</h2>
            <p className="mt-1 text-sm text-gray-500">
              面接評価基準を定義するスコアカードを管理します
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <a
              href="/dashboard/scorecards/new"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </a>
          </div>
        </div>
      </div>

      {scorecards.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">スコアカードが登録されていません</h3>
          <p className="text-xs text-gray-500 mb-4">面接評価基準となるスコアカードを作成してください</p>
          <a
            href="/dashboard/scorecards/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            スコアカードを作成
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {scorecards.map((scorecard) => (
            <div
              key={scorecard.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#FFFBEB' }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: '#D97706' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900 truncate flex-1">
                  {scorecard.name}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    評価基準:{' '}
                    <span className="font-semibold text-gray-900">
                      {scorecard.criteria?.length ?? 0}項目
                    </span>
                  </span>
                </div>

                {scorecard.criteria && scorecard.criteria.length > 0 && (
                  <div className="space-y-1 mb-4">
                    {scorecard.criteria.slice(0, 3).map((criterion) => (
                      <div
                        key={criterion.id}
                        className="flex items-center justify-between text-xs text-gray-500"
                      >
                        <span className="truncate">{criterion.name}</span>
                        <span className="text-gray-400 flex-shrink-0 ml-2">
                          重み: {criterion.weight} / {criterion.maxScore}点
                        </span>
                      </div>
                    ))}
                    {(scorecard.criteria.length ?? 0) > 3 && (
                      <p className="text-xs text-gray-400">
                        他 {(scorecard.criteria.length ?? 0) - 3} 項目...
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(scorecard.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                  <button
                    onClick={() => handleDelete(scorecard.id)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
