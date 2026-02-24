'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerService } from '@/lib/services';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await customerService.create({ name, description });
      router.push('/dashboard/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">顧客企業作成</h2>
        <p className="mt-1 text-sm text-gray-500">新しい顧客企業を登録します</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Card Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
              <svg className="w-5 h-5" style={{ color: '#4F46E5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">企業情報</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-rose-700">{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  企業名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 株式会社サンプル"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="業種、従業員数などの情報を記載してください"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  業種、従業員数などの情報を記載してください
                </p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
