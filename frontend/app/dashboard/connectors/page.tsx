'use client';

import { useEffect, useState } from 'react';
import { connectorService } from '@/lib/services';
import { Connector } from '@/types';
import toast from 'react-hot-toast';

const connectorTypeLabels: Record<string, string> = {
  indeed: 'Indeed',
  'kyujin-box': '求人ボックス',
  rikunabi: 'リクナビNEXT',
  mynavi: 'マイナビ転職',
  doda: 'doda',
  dummy: 'ダミー（テスト用）',
};

const connectorTypeIcons: Record<string, string> = {
  indeed: '🌐',
  'kyujin-box': '📦',
  rikunabi: '🔵',
  mynavi: '🔷',
  doda: '🟠',
  dummy: '🔧',
};

const connectorTypeColors: Record<string, { gradient: string; text: string }> = {
  indeed: { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-600' },
  'kyujin-box': { gradient: 'from-sky-500 to-blue-500', text: 'text-sky-600' },
  rikunabi: { gradient: 'from-blue-600 to-cyan-600', text: 'text-blue-700' },
  mynavi: { gradient: 'from-cyan-500 to-blue-600', text: 'text-cyan-600' },
  doda: { gradient: 'from-sky-600 to-blue-700', text: 'text-sky-700' },
  dummy: { gradient: 'from-slate-500 to-gray-500', text: 'text-slate-600' },
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      const response = await connectorService.getAll();
      setConnectors(response.data || response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'コネクタ一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const result = await connectorService.testConnection(id);
      if (result.success) {
        toast.success('接続テスト成功しました');
      } else {
        toast.error(`接続テスト失敗: ${result.error || '不明なエラー'}`);
      }
    } catch (err: any) {
      toast.error(`接続テスト失敗: ${err.response?.data?.message || err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!confirm(`コネクタを${currentStatus ? '無効化' : '有効化'}しますか？`)) {
      return;
    }

    try {
      await connectorService.update(id, { isActive: !currentStatus });
      toast.success(`コネクタを${currentStatus ? '無効化' : '有効化'}しました`);
      await loadConnectors();
    } catch (err: any) {
      toast.error(`更新に失敗しました: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このコネクタを削除しますか？\n※削除すると関連する掲載履歴も参照できなくなります。')) {
      return;
    }

    try {
      await connectorService.delete(id);
      toast.success('コネクタを削除しました');
      await loadConnectors();
    } catch (err: any) {
      toast.error(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
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

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              コネクタ設定
            </h1>
            <p className="text-sm sm:text-base text-gray-600 flex items-center space-x-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">求人媒体APIとの連携設定を管理します</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <a
              href="/dashboard/connectors/new"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-sky-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規コネクタ追加
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
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg'
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
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg'
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

      {/* Connector Cards Grid */}
      {connectors.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">コネクタが登録されていません</h3>
          <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">求人媒体と連携を開始しましょう</p>
          <a
            href="/dashboard/connectors/new"
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-sky-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規コネクタを追加
          </a>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {connectors.map((connector, index) => {
            const colors = connectorTypeColors[connector.type] || connectorTypeColors.dummy;
            return (
              <div
                key={connector.id}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200 transform hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Card Header */}
                <div className={`relative p-4 sm:p-5 lg:p-6 bg-gradient-to-br ${colors.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white opacity-10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative z-10 flex items-start justify-between min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
                        {connectorTypeIcons[connector.type] || '📡'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider truncate">
                          {connectorTypeLabels[connector.type] || connector.type}
                        </p>
                        <h3 className="text-base sm:text-lg font-black text-white truncate">
                          {connector.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="space-y-2 sm:space-y-3 mb-4">
                    {/* Status */}
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-bold text-slate-700">ステータス</span>
                      <span
                        className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold ${
                          connector.isActive
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
                        }`}
                      >
                        {connector.isActive ? (
                          <>
                            <span className="mr-1">✅</span>
                            有効
                          </>
                        ) : (
                          <>
                            <span className="mr-1">⏸</span>
                            無効
                          </>
                        )}
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-700 flex-shrink-0">作成日</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-600 truncate ml-2">
                        {new Date(connector.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleTestConnection(connector.id)}
                      disabled={testingId === connector.id}
                      className="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-semibold rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all disabled:opacity-50"
                    >
                      {testingId === connector.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          テスト中...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          接続テスト
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`/dashboard/connectors/${connector.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:from-slate-100 hover:to-slate-200 transition-all"
                      >
                        <svg className="w-4 h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        編集
                      </a>
                      <button
                        onClick={() => handleToggleActive(connector.id, connector.isActive)}
                        className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 text-sm font-semibold rounded-lg hover:from-sky-100 hover:to-blue-100 transition-all whitespace-nowrap"
                      >
                        {connector.isActive ? '無効化' : '有効化'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(connector.id)}
                      className="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-red-50 to-pink-50 text-red-600 text-sm font-semibold rounded-lg hover:from-red-100 hover:to-pink-100 transition-all"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {connectors.map((connector, index) => {
            const colors = connectorTypeColors[connector.type] || connectorTypeColors.dummy;
            return (
              <div
                key={connector.id}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-blue-200"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* List Item Header */}
                  <div className={`relative p-4 sm:p-6 sm:w-48 lg:w-56 bg-gradient-to-br ${colors.gradient} flex sm:flex-col items-center sm:items-start justify-between sm:justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    <div className="relative z-10 bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-2xl sm:text-3xl md:text-4xl mb-0 sm:mb-3">
                      {connectorTypeIcons[connector.type] || '📡'}
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-white/80 uppercase tracking-wider truncate">
                        {connectorTypeLabels[connector.type] || connector.type}
                      </p>
                    </div>
                  </div>

                  {/* List Item Body */}
                  <div className="flex-1 p-4 sm:p-6 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-2 sm:mb-0">
                        {connector.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          connector.isActive
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
                        }`}
                      >
                        {connector.isActive ? (
                          <>
                            <span className="mr-1">✅</span>
                            有効
                          </>
                        ) : (
                          <>
                            <span className="mr-1">⏸</span>
                            無効
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center text-sm min-w-0">
                        <div className="bg-slate-100 p-1.5 sm:p-2 rounded-lg mr-2 flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 font-medium">作成日</p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {new Date(connector.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleTestConnection(connector.id)}
                        disabled={testingId === connector.id}
                        className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-semibold rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all disabled:opacity-50"
                      >
                        {testingId === connector.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            テスト中...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            接続テスト
                          </>
                        )}
                      </button>
                      <a
                        href={`/dashboard/connectors/${connector.id}`}
                        className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:from-slate-100 hover:to-slate-200 transition-all"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        編集
                      </a>
                      <button
                        onClick={() => handleToggleActive(connector.id, connector.isActive)}
                        className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 text-sm font-semibold rounded-lg hover:from-sky-100 hover:to-blue-100 transition-all"
                      >
                        {connector.isActive ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() => handleDelete(connector.id)}
                        className="inline-flex items-center px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-red-50 to-pink-50 text-red-600 text-sm font-semibold rounded-lg hover:from-red-100 hover:to-pink-100 transition-all"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
