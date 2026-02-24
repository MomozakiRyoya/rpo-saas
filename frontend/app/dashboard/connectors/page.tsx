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
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* ページタイトル */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">コネクタ設定</h2>
          <p className="mt-1 text-sm text-gray-500">求人媒体APIとの連携設定を管理します</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* 表示切替 */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <a
            href="/dashboard/connectors/new"
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規コネクタ追加
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-rose-700">{error}</span>
          </div>
        </div>
      )}

      {/* 空状態 */}
      {connectors.length === 0 ? (
        <div
          className="bg-white border border-gray-100 rounded-2xl p-12 text-center"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">コネクタが登録されていません</h3>
          <p className="text-sm text-gray-500 mb-6">求人媒体と連携を開始しましょう</p>
          <a
            href="/dashboard/connectors/new"
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規コネクタを追加
          </a>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              {/* カードヘッダー */}
              <div
                className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
                  >
                    {connectorTypeIcons[connector.type] || '📡'}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {connectorTypeLabels[connector.type] || connector.type}
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {connector.name}
                    </h3>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    connector.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {connector.isActive ? '有効' : '無効'}
                </span>
              </div>

              {/* カードボディ */}
              <div className="p-5">
                <div className="flex items-center text-sm text-gray-500 mb-5">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  作成日: {new Date(connector.createdAt).toLocaleDateString('ja-JP')}
                </div>

                {/* アクション */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleTestConnection(connector.id)}
                    disabled={testingId === connector.id}
                    className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
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
                      className="flex-1 inline-flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      編集
                    </a>
                    <button
                      onClick={() => handleToggleActive(connector.id, connector.isActive)}
                      className="flex-1 inline-flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                    >
                      {connector.isActive ? '無効化' : '有効化'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(connector.id)}
                    className="w-full inline-flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4">
                {/* 左: アイコン + 情報 */}
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
                  >
                    {connectorTypeIcons[connector.type] || '📡'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-gray-900">{connector.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          connector.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {connector.isActive ? '有効' : '無効'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {connectorTypeLabels[connector.type] || connector.type} ・ {new Date(connector.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>

                {/* 右: アクション */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(connector.id)}
                    disabled={testingId === connector.id}
                    className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
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
                    className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    編集
                  </a>
                  <button
                    onClick={() => handleToggleActive(connector.id, connector.isActive)}
                    className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    {connector.isActive ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleDelete(connector.id)}
                    className="inline-flex items-center bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    削除
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
