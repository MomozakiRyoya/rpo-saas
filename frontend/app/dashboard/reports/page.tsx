'use client';

import { useEffect, useState } from 'react';
import { reportService, jobService } from '@/lib/services';
import { Job } from '@/types';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [downloadingJob, setDownloadingJob] = useState(false);
  const [downloadingMonthly, setDownloadingMonthly] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobService.getAll({ limit: 100 });
      setJobs(response.data);
    } catch {
      toast.error('求人一覧の取得に失敗しました');
    } finally {
      setLoadingJobs(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJobReport = async () => {
    if (!selectedJobId) {
      toast.error('求人を選択してください');
      return;
    }
    setDownloadingJob(true);
    try {
      const blob = await reportService.downloadJobReport(selectedJobId);
      const job = jobs.find((j) => j.id === selectedJobId);
      triggerDownload(blob, `job-report-${job?.title ?? selectedJobId}.pdf`);
      toast.success('レポートをダウンロードしました');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ダウンロードに失敗しました');
    } finally {
      setDownloadingJob(false);
    }
  };

  const handleDownloadMonthlyReport = async () => {
    if (!selectedMonth) {
      toast.error('月を選択してください');
      return;
    }
    setDownloadingMonthly(true);
    try {
      const blob = await reportService.downloadMonthlyReport(selectedMonth);
      triggerDownload(blob, `monthly-report-${selectedMonth}.pdf`);
      toast.success('月次レポートをダウンロードしました');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ダウンロードに失敗しました');
    } finally {
      setDownloadingMonthly(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl font-bold text-gray-900">レポート</h2>
        <p className="mt-1 text-sm text-gray-500">
          各種レポートをダウンロードできます
        </p>
      </div>

      <div className="space-y-6">
        {/* 月次レポート */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#EFF6FF' }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: '#2563EB' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">月次レポート</span>
              <p className="text-xs text-gray-500">指定した月の活動サマリーをPDF出力します</p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対象月
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-48 border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-gray-900"
                />
              </div>
              <button
                onClick={handleDownloadMonthlyReport}
                disabled={downloadingMonthly}
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {downloadingMonthly ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ダウンロード中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDFをダウンロード
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 求人個票レポート */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#F0FDF4' }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: '#16A34A' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">求人個票レポート</span>
              <p className="text-xs text-gray-500">選択した求人の詳細レポートをPDF出力します</p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対象求人
                </label>
                {loadingJobs ? (
                  <div className="w-full h-10 bg-gray-100 animate-pulse rounded-xl" />
                ) : (
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white text-gray-900"
                  >
                    <option value="">求人を選択してください</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={handleDownloadJobReport}
                disabled={downloadingJob || !selectedJobId}
                className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {downloadingJob ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ダウンロード中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDFをダウンロード
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
