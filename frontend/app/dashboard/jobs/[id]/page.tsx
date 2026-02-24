'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobService, generationService } from '@/lib/services';
import { Job } from '@/types';
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
  GENERATED: 'bg-blue-100 text-blue-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PUBLISHING: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-indigo-100 text-indigo-700',
  PUBLISH_FAILED: 'bg-rose-100 text-rose-700',
  STOPPED: 'bg-gray-100 text-gray-600',
};

const publicationStatusLabels: Record<string, string> = {
  PUBLISHED: '掲載中',
  PUBLISHING: '掲載処理中',
  FAILED: '掲載失敗',
  STOPPED: '掲載停止',
};

const publicationStatusStyles: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  PUBLISHING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-rose-100 text-rose-700',
  STOPPED: 'bg-gray-100 text-gray-600',
};

const publicationDotStyles: Record<string, string> = {
  PUBLISHED: 'bg-emerald-400',
  PUBLISHING: 'bg-amber-400',
  FAILED: 'bg-rose-400',
  STOPPED: 'bg-gray-400',
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [textVersion, setTextVersion] = useState<any | null>(null);

  useEffect(() => {
    if (params.id) {
      loadJob();
    }
  }, [params.id]);

  const loadJob = async () => {
    try {
      const data = await jobService.getOne(params.id as string);
      setJob(data);
      // テキストバージョンを取得（最新の1つのみ）
      const versions = await jobService.getTextVersions(params.id as string);
      setTextVersion(versions.length > 0 ? versions[0] : null);
    } catch (err) {
      console.error('Failed to load job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateText = async () => {
    if (!job) return;
    setGenerating(true);
    try {
      await generationService.generateText(job.id);
      toast.success('テキスト生成が完了しました');
      loadJob();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'テキスト生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!job) return;
    setGenerating(true);
    try {
      await generationService.generateImage(job.id);
      toast.success('画像生成が完了しました');
      loadJob();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '画像生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!job || !confirm('承認申請を行いますか？')) return;
    try {
      await jobService.submitForApproval(job.id);
      toast.success('承認申請が完了しました');
      router.push('/dashboard/approvals');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '承認申請に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-gray-500 text-sm">求人が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{job.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[job.status] || 'bg-gray-100 text-gray-600'}`}>
              {statusLabels[job.status] || job.status}
            </span>
            {job.customer?.name && (
              <span className="text-sm text-gray-500 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.customer.name}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <button
            onClick={handleGenerateText}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {generating ? '生成中...' : 'テキスト生成'}
          </button>
          <button
            onClick={handleGenerateImage}
            disabled={generating}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {generating ? '生成中...' : '画像生成'}
          </button>
          {(job.status === 'DRAFT' || job.status === 'GENERATED') && (
            <button
              onClick={handleSubmitForApproval}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              承認申請
            </button>
          )}
        </div>
      </div>

      {/* Job Info Card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: '#EFF6FF' }}>
            <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">求人情報</span>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500 mb-1">勤務地</dt>
              <dd className="text-sm text-gray-900">{job.location || '-'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500 mb-1">給与</dt>
              <dd className="text-sm text-gray-900">{job.salary || '-'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-gray-500 mb-1">雇用形態</dt>
              <dd className="text-sm text-gray-900">{job.employmentType || '-'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 mb-1">職種説明</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {job.description || '-'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 mb-1">応募要件</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {job.requirements || '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Generated Text Card */}
      {textVersion && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">生成されたテキスト</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(textVersion.createdAt).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="p-5">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {textVersion.content}
            </div>
          </div>
        </div>
      )}

      {/* Publications Card */}
      {job.publications && job.publications.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">求人媒体連携状況</span>
            </div>
            <span className="text-xs text-gray-500">{job.publications.length}件の媒体と連携中</span>
          </div>
          <div className="divide-y divide-gray-100">
            {job.publications.map((pub: any) => (
              <div key={pub.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${publicationDotStyles[pub.status] || 'bg-blue-400'}`}></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pub.connector?.name || '不明な媒体'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {publicationStatusLabels[pub.status] || '掲載待機中'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${publicationStatusStyles[pub.status] || 'bg-blue-100 text-blue-700'}`}>
                      {pub.status}
                    </span>
                    {pub.publishedAt && (
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(pub.publishedAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
