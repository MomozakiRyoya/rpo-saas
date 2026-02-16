'use client';

import { useEffect, useState } from 'react';
import { connectorService } from '@/lib/services';
import { Connector } from '@/types';

const connectorTypeLabels: Record<string, string> = {
  indeed: 'Indeed',
  'kyujin-box': '求人ボックス',
  dummy: 'ダミー（テスト用）',
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

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
        alert('接続テスト成功しました');
      } else {
        alert(`接続テスト失敗: ${result.error || '不明なエラー'}`);
      }
    } catch (err: any) {
      alert(`接続テスト失敗: ${err.response?.data?.message || err.message}`);
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
      await loadConnectors();
    } catch (err: any) {
      alert(`更新に失敗しました: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このコネクタを削除しますか？\n※削除すると関連する掲載履歴も参照できなくなります。')) {
      return;
    }

    try {
      await connectorService.delete(id);
      await loadConnectors();
    } catch (err: any) {
      alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="px-4 sm:px-0">読み込み中...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">コネクタ設定</h1>
          <p className="mt-2 text-sm text-gray-700">
            求人媒体APIとの連携設定を管理します
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a
            href="/dashboard/connectors/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            新規コネクタ追加
          </a>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      コネクタ名
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      媒体タイプ
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      ステータス
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      作成日
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {connectors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">
                        コネクタが登録されていません
                      </td>
                    </tr>
                  ) : (
                    connectors.map((connector) => (
                      <tr key={connector.id}>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900">
                          {connector.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {connectorTypeLabels[connector.type] || connector.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              connector.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {connector.isActive ? '有効' : '無効'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(connector.createdAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleTestConnection(connector.id)}
                              disabled={testingId === connector.id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                            >
                              {testingId === connector.id ? 'テスト中...' : '接続テスト'}
                            </button>
                            <a
                              href={`/dashboard/connectors/${connector.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              編集
                            </a>
                            <button
                              onClick={() => handleToggleActive(connector.id, connector.isActive)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              {connector.isActive ? '無効化' : '有効化'}
                            </button>
                            <button
                              onClick={() => handleDelete(connector.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
