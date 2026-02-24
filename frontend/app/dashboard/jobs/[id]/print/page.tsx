'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function JobPrintPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [textVersion, setTextVersion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  useEffect(() => {
    if (!loading && job) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, job]);

  const loadJob = async () => {
    try {
      const data = await jobService.getOne(params.id as string);
      setJob(data);
      const versions = await jobService.getTextVersions(params.id as string);
      setTextVersion(versions.length > 0 ? versions[0] : null);
    } catch (err) {
      console.error('Failed to load job:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-3 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">求人が見つかりません</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { margin: 20mm; size: A4; }
        }
        body { font-family: 'Hiragino Sans', 'Meiryo', sans-serif; }
      `}</style>

      {/* 印刷前に表示するツールバー */}
      <div className="no-print bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷 / PDF保存
        </button>
      </div>

      {/* 印刷コンテンツ */}
      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* ヘッダー */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-sm text-gray-500">
                顧客: {job.customer?.name || '未設定'} ／
                ステータス: {statusLabels[job.status] || job.status} ／
                更新日: {new Date(job.updatedAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
            基本情報
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {job.location && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500 font-medium w-32">勤務地</td>
                  <td className="py-2 text-gray-900">{job.location}</td>
                </tr>
              )}
              {job.salary && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500 font-medium w-32">給与</td>
                  <td className="py-2 text-gray-900">{job.salary}</td>
                </tr>
              )}
              {job.employmentType && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-500 font-medium w-32">雇用形態</td>
                  <td className="py-2 text-gray-900">{job.employmentType}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 求人概要 */}
        {job.description && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              概要
            </h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </section>
        )}

        {/* 応募要件 */}
        {job.requirements && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              応募要件
            </h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
          </section>
        )}

        {/* AI生成テキスト */}
        {textVersion && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">
              求人広告文 (v{textVersion.version})
            </h2>
            <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
              {textVersion.content}
            </div>
          </section>
        )}

        {/* フッター */}
        <div className="border-t border-gray-200 pt-4 mt-8 text-xs text-gray-400 text-right">
          出力日時: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>
    </>
  );
}
