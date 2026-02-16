'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectorService } from '@/lib/services';

const connectorTypes = [
  { value: 'indeed', label: 'Indeed' },
  { value: 'kyujin-box', label: '求人ボックス' },
  { value: 'dummy', label: 'ダミー（テスト用）' },
];

export default function NewConnectorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'indeed',
  });

  const [config, setConfig] = useState({
    // Indeed
    apiKey: '',
    publisherId: '',
    apiUrl: '',
    // 求人ボックス
    companyId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 選択されたコネクタタイプに応じて必要なconfigを構築
      let connectorConfig: Record<string, any> = {};

      if (formData.type === 'indeed') {
        connectorConfig = {
          apiKey: config.apiKey,
          publisherId: config.publisherId,
          apiUrl: config.apiUrl || 'https://api.indeed.com/v1',
        };
      } else if (formData.type === 'kyujin-box') {
        connectorConfig = {
          apiKey: config.apiKey,
          companyId: config.companyId,
          apiUrl: config.apiUrl || 'https://api.kyujinbox.com/v1',
        };
      } else if (formData.type === 'dummy') {
        connectorConfig = {};
      }

      await connectorService.create({
        name: formData.name,
        type: formData.type,
        config: connectorConfig,
      });

      router.push('/dashboard/connectors');
    } catch (err: any) {
      setError(err.response?.data?.message || 'コネクタの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'indeed':
        return (
          <>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Indeed API認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="publisherId" className="block text-sm font-medium text-gray-700">
                Publisher ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="publisherId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.publisherId}
                onChange={(e) => setConfig({ ...config, publisherId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Indeed Publisher ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://api.indeed.com/v1"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">デフォルト: https://api.indeed.com/v1</p>
            </div>
          </>
        );

      case 'kyujin-box':
        return (
          <>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">求人ボックスAPI認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                Company ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.companyId}
                onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">求人ボックスのCompany ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://api.kyujinbox.com/v1"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">デフォルト: https://api.kyujinbox.com/v1</p>
            </div>
          </>
        );

      case 'dummy':
        return (
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              ダミーコネクタはテスト用です。実際の媒体APIへの連携は行われず、モックデータを返します。
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <a
          href="/dashboard/connectors"
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          ← コネクタ一覧に戻る
        </a>
      </div>

      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">新規コネクタ作成</h1>
          <p className="mt-2 text-sm text-gray-700">
            求人媒体APIとの連携設定を追加します
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            コネクタ名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例: Indeed本番環境"
          />
          <p className="mt-1 text-xs text-gray-500">管理画面で表示される名前</p>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            媒体タイプ <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={formData.type}
            onChange={(e) => {
              setFormData({ ...formData, type: e.target.value });
              // リセット
              setConfig({ apiKey: '', publisherId: '', apiUrl: '', companyId: '' });
            }}
          >
            {connectorTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API認証情報</h3>
          <div className="space-y-4">
            {renderConfigFields()}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? '作成中...' : 'コネクタを作成'}
          </button>
          <a
            href="/dashboard/connectors"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            キャンセル
          </a>
        </div>
      </form>
    </div>
  );
}
