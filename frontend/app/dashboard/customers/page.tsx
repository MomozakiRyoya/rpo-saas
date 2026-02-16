'use client';

import { useEffect, useState } from 'react';
import { customerService } from '@/lib/services';
import { Customer } from '@/types';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '顧客一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      await customerService.delete(id);
      toast.success('顧客を削除しました');
      loadCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              顧客企業一覧
            </h1>
            <p className="text-sm sm:text-base text-gray-600 flex items-center space-x-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">登録されている顧客企業の一覧です</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <a
              href="/dashboard/customers/new"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </a>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-end space-x-2">
          <span className="text-xs sm:text-sm text-gray-600 font-medium mr-2">表示形式:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="ml-2 hidden sm:inline text-sm font-semibold">グリッド</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="ml-2 hidden sm:inline text-sm font-semibold">リスト</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base text-red-800 font-medium break-words">{error}</span>
          </div>
        </div>
      )}

      {/* Customer Cards Grid */}
      {customers.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">顧客が登録されていません</h3>
          <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">最初の顧客を追加してビジネスを始めましょう</p>
          <a
            href="/dashboard/customers/new"
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規顧客を作成
          </a>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 transform hover:-translate-y-1"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 sm:p-5 lg:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full">
                    <span className="text-white text-xs sm:text-sm font-bold">{customer._count?.jobs || 0} 件</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
                  {customer.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {customer.description || '説明なし'}
                </p>

                <div className="flex items-center justify-between text-xs sm:text-sm mb-4 pb-4 border-b border-slate-100 min-w-0">
                  <div className="flex items-center text-slate-500 min-w-0 mr-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium truncate">
                      {new Date(customer.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium whitespace-nowrap">{customer._count?.jobs || 0} 求人</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <a
                    href={`/dashboard/customers/${customer.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-semibold rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all"
                  >
                    <svg className="w-4 h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    詳細
                  </a>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-red-50 to-pink-50 text-red-600 font-semibold rounded-lg hover:from-red-100 hover:to-pink-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
            >
              <div className="flex flex-col sm:flex-row">
                {/* List Item Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 sm:p-6 sm:w-48 lg:w-56 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="relative z-10 bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl mb-0 sm:mb-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="relative z-10 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-xs sm:text-sm font-bold whitespace-nowrap">{customer._count?.jobs || 0} 件</span>
                  </div>
                </div>

                {/* List Item Body */}
                <div className="flex-1 p-4 sm:p-6 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-2 sm:mb-0">
                      {customer.name}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <a
                        href={`/dashboard/customers/${customer.id}`}
                        className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-semibold rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        詳細
                      </a>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-red-50 to-pink-50 text-red-600 font-semibold rounded-lg hover:from-red-100 hover:to-pink-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {customer.description || '説明なし'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm pt-3 sm:pt-4 border-t border-slate-100">
                    <div className="flex items-center text-slate-500">
                      <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        登録日: {new Date(customer.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">求人数: {customer._count?.jobs || 0} 件</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
