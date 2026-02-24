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

  const inputClass = 'w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'indeed':
        return (
          <>
            <div>
              <label htmlFor="apiKey" className={labelClass}>
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                required
                className={inputClass}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Indeed API認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="publisherId" className={labelClass}>
                Publisher ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="publisherId"
                required
                className={inputClass}
                value={config.publisherId}
                onChange={(e) => setConfig({ ...config, publisherId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Indeed Publisher ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className={labelClass}>
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className={inputClass}
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
              <label htmlFor="apiKey" className={labelClass}>
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                required
                className={inputClass}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">求人ボックスAPI認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="companyId" className={labelClass}>
                Company ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="companyId"
                required
                className={inputClass}
                value={config.companyId}
                onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">求人ボックスのCompany ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className={labelClass}>
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className={inputClass}
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
              <label htmlFor="clientId" className={labelClass}>
                Client ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="clientId"
                required
                className={inputClass}
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">リクナビAPI用のClient ID</p>
            </div>

            <div>
              <label htmlFor="clientSecret" className={labelClass}>
                Client Secret <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="clientSecret"
                required
                className={inputClass}
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">リクナビAPI用のClient Secret</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className={labelClass}>
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className={inputClass}
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
              <label htmlFor="apiKey" className={labelClass}>
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                required
                className={inputClass}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">マイナビAPI認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="accountId" className={labelClass}>
                Account ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="accountId"
                required
                className={inputClass}
                value={config.accountId}
                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">マイナビのAccount ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className={labelClass}>
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className={inputClass}
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
              <label htmlFor="apiKey" className={labelClass}>
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                required
                className={inputClass}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">doda API認証用のAPIキー</p>
            </div>

            <div>
              <label htmlFor="partnerId" className={labelClass}>
                Partner ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="partnerId"
                required
                className={inputClass}
                value={config.partnerId}
                onChange={(e) => setConfig({ ...config, partnerId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">dodaのPartner ID</p>
            </div>

            <div>
              <label htmlFor="apiUrl" className={labelClass}>
                API URL（オプション）
              </label>
              <input
                type="text"
                id="apiUrl"
                className={inputClass}
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
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-sm text-indigo-700">
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
      {/* 戻るリンク */}
      <div className="mb-6">
        <a
          href="/dashboard/connectors"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          コネクタ一覧に戻る
        </a>
      </div>

      {/* ページタイトル */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">新規コネクタ作成</h2>
        <p className="mt-1 text-sm text-gray-500">求人媒体APIとの連携設定を追加します</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* コネクタ名 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">基本情報</h3>
          </div>
          <div className="p-5">
            <label htmlFor="name" className={labelClass}>
              コネクタ名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              className={inputClass}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: Indeed本番環境"
            />
            <p className="mt-1 text-xs text-gray-500">管理画面で表示される名前</p>
          </div>
        </div>

        {/* 媒体タイプ選択 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">媒体タイプを選択</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {connectorTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, type: type.value });
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
                  className={`relative rounded-xl p-4 flex flex-col items-start focus:outline-none transition-all ${
                    formData.type === type.value
                      ? 'border-2 border-indigo-500 bg-indigo-50 cursor-pointer'
                      : 'border-2 border-gray-200 bg-white cursor-pointer hover:border-indigo-300'
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
                      <p className="text-xs text-gray-500 mt-0.5">
                        {type.description}
                      </p>
                    </div>
                    {formData.type === type.value && (
                      <svg className="h-5 w-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API認証情報 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">API認証情報</h3>
              <p className="text-xs text-gray-500">認証情報は暗号化して安全に保存されます</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {renderConfigFields()}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '作成中...' : 'コネクタを作成'}
          </button>
          <a
            href="/dashboard/connectors"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            キャンセル
          </a>
        </div>
      </form>
    </div>
  );
}
