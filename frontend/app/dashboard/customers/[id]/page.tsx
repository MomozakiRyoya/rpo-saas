'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customerService, jobService } from '@/lib/services';
import { Customer, Job } from '@/types';
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

const statusStyles: Record<string, { gradient: string; text: string; icon: string }> = {
  DRAFT: { gradient: 'from-slate-100 to-slate-200', text: 'text-slate-700', icon: '📝' },
  GENERATED: { gradient: 'from-blue-100 to-blue-200', text: 'text-blue-700', icon: '✨' },
  PENDING_APPROVAL: { gradient: 'from-cyan-100 to-sky-200', text: 'text-cyan-700', icon: '⏳' },
  APPROVED: { gradient: 'from-emerald-100 to-emerald-200', text: 'text-emerald-700', icon: '✅' },
  PUBLISHING: { gradient: 'from-blue-100 to-cyan-200', text: 'text-blue-700', icon: '🚀' },
  PUBLISHED: { gradient: 'from-green-100 to-green-200', text: 'text-green-700', icon: '🌟' },
  PUBLISH_FAILED: { gradient: 'from-red-100 to-red-200', text: 'text-red-700', icon: '❌' },
  STOPPED: { gradient: 'from-gray-100 to-gray-200', text: 'text-gray-700', icon: '⏸' },
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (params.id) {
      loadCustomer();
      loadCustomerJobs();
    }
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      const data = await customerService.getOne(params.id as string);
      setCustomer(data);
      setEditForm({ name: data.name, description: data.description || '' });
    } catch (err) {
      console.error('Failed to load customer:', err);
      toast.error('顧客情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerJobs = async () => {
    try {
      const response = await jobService.getAll({ customerId: params.id as string });
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to load customer jobs:', err);
    }
  };

  const handleUpdate = async () => {
    if (!customer) return;
    try {
      await customerService.update(customer.id, editForm);
      toast.success('顧客情報を更新しました');
      setIsEditing(false);
      loadCustomer();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!customer || !confirm('この顧客を削除しますか？\n※関連する求人も削除される可能性があります。')) return;
    try {
      await customerService.delete(customer.id);
      toast.success('顧客を削除しました');
      router.push('/dashboard/customers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '削除に失敗しました');
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

  if (!customer) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-200 to-red-300 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-2">顧客が見つかりません</h3>
          <p className="text-sm sm:text-base text-red-600 mb-4 sm:mb-6">指定された顧客は存在しないか、削除された可能性があります</p>
          <button
            onClick={() => router.push('/dashboard/customers')}
            className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            顧客一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="inline-flex items-center px-3 py-2 min-h-[44px] bg-white border-2 border-slate-200 text-slate-600 rounded-lg hover:border-blue-300 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                {customer.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                顧客ID: {customer.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-semibold rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-red-50 to-pink-50 text-red-600 text-sm font-semibold rounded-lg hover:from-red-100 hover:to-pink-100 transition-all"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  削除
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: customer.name, description: customer.description || '' });
                  }}
                  className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-white border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:border-slate-300 transition-all"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                顧客情報
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">企業名</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">説明</label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="顧客企業の説明を入力..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mb-1">企業名</label>
                    <p className="text-sm sm:text-base text-slate-900 font-semibold">{customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mb-1">説明</label>
                    <p className="text-sm sm:text-base text-slate-700 break-words">{customer.description || '説明なし'}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 mb-2">
                      <span className="font-medium">登録日</span>
                      <span className="font-semibold">{new Date(customer.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 mb-2">
                      <span className="font-medium">最終更新</span>
                      <span className="font-semibold">{new Date(customer.updatedAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
                      <span className="font-medium">求人数</span>
                      <span className="font-semibold">{jobs.length} 件</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Jobs */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg sm:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  関連求人
                </h3>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs sm:text-sm font-bold">
                  {jobs.length} 件
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {jobs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 font-medium mb-4">この顧客の求人はまだありません</p>
                  <a
                    href="/dashboard/jobs/new"
                    className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    新規求人を作成
                  </a>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {jobs.map((job) => {
                    const statusStyle = statusStyles[job.status] || statusStyles.DRAFT;
                    return (
                      <a
                        key={job.id}
                        href={`/dashboard/jobs/${job.id}`}
                        className="group block bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1 min-w-0 mr-3">
                            {job.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusStyle.gradient} ${statusStyle.text} whitespace-nowrap flex-shrink-0`}>
                            <span className="mr-1">{statusStyle.icon}</span>
                            <span className="hidden sm:inline">{statusLabels[job.status]}</span>
                          </span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-slate-500 space-x-3 sm:space-x-4">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium truncate">{new Date(job.updatedAt).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
