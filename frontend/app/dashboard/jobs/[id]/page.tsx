'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobService, generationService } from '@/lib/services';
import { Job } from '@/types';

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
      alert('テキスト生成が完了しました');
      loadJob();
    } catch (err: any) {
      alert(err.response?.data?.message || 'テキスト生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!job) return;
    setGenerating(true);
    try {
      await generationService.generateImage(job.id);
      alert('画像生成が完了しました');
      loadJob();
    } catch (err: any) {
      alert(err.response?.data?.message || '画像生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!job || !confirm('承認申請を行いますか？')) return;
    try {
      await jobService.submitForApproval(job.id);
      alert('承認申請が完了しました');
      router.push('/dashboard/approvals');
    } catch (err: any) {
      alert(err.response?.data?.message || '承認申請に失敗しました');
    }
  };

  if (loading) {
    return <div className="px-4 sm:px-0">読み込み中...</div>;
  }

  if (!job) {
    return <div className="px-4 sm:px-0">求人が見つかりません</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {job.title}
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              ステータス: <span className="ml-2 font-semibold">{job.status}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              顧客: {job.customer?.name}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            求人情報
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">勤務地</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.location || '-'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">給与</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.salary || '-'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">雇用形態</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.employmentType || '-'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">職種説明</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {job.description || '-'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">応募要件</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {job.requirements || '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {textVersion && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg overflow-hidden sm:rounded-xl border border-blue-100">
          <div className="px-6 py-5 sm:px-8 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    生成されたテキスト
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(textVersion.createdAt).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-6 sm:p-8">
            <div className="prose prose-sm max-w-none">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                {textVersion.content}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleGenerateText}
          disabled={generating}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {generating ? '生成中...' : 'テキスト生成'}
        </button>
        <button
          onClick={handleGenerateImage}
          disabled={generating}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {generating ? '生成中...' : '画像生成'}
        </button>
        {(job.status === 'DRAFT' || job.status === 'GENERATED') && (
          <button
            onClick={handleSubmitForApproval}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            承認申請
          </button>
        )}
      </div>
    </div>
  );
}
