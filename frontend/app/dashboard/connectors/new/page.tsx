'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectorService } from '@/lib/services';

const connectorTypes = [
  {
    value: 'indeed',
    label: 'Indeed',
    description: '世界最大級の求人検索エンジン',
    icon: '🌐'
  },
  {
    value: 'kyujin-box',
    label: '求人ボックス',
    description: 'Kakaoが運営する日本の求人検索エンジン',
    icon: '📦'
  },
  {
    value: 'rikunabi',
    label: 'リクナビNEXT',
    description: '転職・求人情報サイト',
    icon: '🔵'
  },
  {
    value: 'mynavi',
    label: 'マイナビ転職',
    description: '総合転職サイト',
    icon: '🔷'
  },
  {
    value: 'doda',
    label: 'doda',
    description: 'パーソルキャリア運営の転職サイト',
    icon: '🟠'
  },
  {
    value: 'dummy',
    label: 'ダミー（テスト用）',
    description: 'テスト・開発用のモックコネクタ',
    icon: '🔧'
  },
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
    // 共通
    apiKey: '',
    apiUrl: '',
    // Indeed
    publisherId: '',
    // 求人ボックス
    companyId: '',
    // リクナビ
    clientId: '',
    clientSecret: '',
    // マイナビ
    accountId: '',
    // doda
    partnerId: '',
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
      } else if (formData.type === 'rikunabi') {
        connectorConfig = {
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          apiUrl: config.apiUrl || 'https://api.rikunabi.com/v1',
        };
      } else if (formData.type === 'mynavi') {
        connectorConfig = {
          apiKey: config.apiKey,
          accountId: config.accountId,
          apiUrl: config.apiUrl || 'https://api.mynavi.jp/v1',
        };
      } else if (formData.type === 'doda') {
        connectorConfig = {
          apiKey: config.apiKey,
          partnerId: config.partnerId,
          apiUrl: config.apiUrl || 'https://api.doda.jp/v1',
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

      case 'rikunabi':
        return (
          <>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clientId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">リクナビAPI用のClient ID</p>
            </div>

            <div>
              <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="clientSecret"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">リクナビAPI用のClient Secret</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://api.rikunabi.com/v1"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">デフォルト: https://api.rikunabi.com/v1</p>
            </div>
          </>
        );

      case 'mynavi':
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
              <p className="mt-1 text-xs text-gray-500">マイナビAPI認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                Account ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.accountId}
                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">マイナビのAccount ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://api.mynavi.jp/v1"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">デフォルト: https://api.mynavi.jp/v1</p>
            </div>
          </>
        );

      case 'doda':
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
              <p className="mt-1 text-xs text-gray-500">doda API認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700">
                Partner ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="partnerId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                value={config.partnerId}
                onChange={(e) => setConfig({ ...config, partnerId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">dodaのPartner ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://api.doda.jp/v1"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">デフォルト: https://api.doda.jp/v1</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            媒体タイプを選択 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {connectorTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: type.value });
                  // リセット
                  setConfig({
                    apiKey: '',
                    apiUrl: '',
                    publisherId: '',
                    companyId: '',
                    clientId: '',
                    clientSecret: '',
                    accountId: '',
                    partnerId: '',
                  });
                }}
                className={`relative rounded-lg border-2 p-4 flex flex-col items-start hover:border-indigo-500 focus:outline-none transition-all ${
                  formData.type === type.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${
                      formData.type === type.value ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </p>
                  </div>
                  {formData.type === type.value && (
                    <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start space-x-3 mb-4">
            <svg className="h-6 w-6 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">API認証情報</h3>
              <p className="text-sm text-gray-600 mt-1">
                認証情報は暗号化して安全に保存されます
              </p>
            </div>
          </div>
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
