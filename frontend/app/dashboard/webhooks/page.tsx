'use client';

import { useEffect, useState } from 'react';
import { webhookService } from '@/lib/services';
import { WebhookEndpoint, WebhookDelivery } from '@/types';
import toast from 'react-hot-toast';

function DeliveryRow({ delivery }: { delivery: WebhookDelivery }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-xs">
      <div className="flex items-center space-x-2 min-w-0">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
            delivery.success
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {delivery.success ? '成功' : '失敗'}
        </span>
        <span className="text-gray-600 font-medium truncate">{delivery.event}</span>
        {delivery.responseStatus && (
          <span className="text-gray-400 flex-shrink-0">HTTP {delivery.responseStatus}</span>
        )}
      </div>
      <span className="text-gray-400 flex-shrink-0 ml-2">
        {new Date(delivery.createdAt).toLocaleString('ja-JP')}
      </span>
    </div>
  );
}

interface EndpointCardProps {
  endpoint: WebhookEndpoint;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

function EndpointCard({ endpoint, onDelete, onToggle }: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const handleExpand = async () => {
    if (!expanded && deliveries.length === 0) {
      setLoadingDeliveries(true);
      try {
        const data = await webhookService.getDeliveries(endpoint.id);
        setDeliveries(data);
      } catch {
        toast.error('配信ログの取得に失敗しました');
      } finally {
        setLoadingDeliveries(false);
      }
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: endpoint.isActive ? '#F0FDF4' : '#F9FAFB' }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: endpoint.isActive ? '#16A34A' : '#9CA3AF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{endpoint.url}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {endpoint.events.map((event) => (
                <span
                  key={event}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600"
                >
                  {event}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              作成: {new Date(endpoint.createdAt).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              endpoint.isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {endpoint.isActive ? '有効' : '無効'}
          </span>
          <button
            onClick={() => onToggle(endpoint.id, endpoint.isActive)}
            className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-medium rounded-lg transition-colors"
          >
            {endpoint.isActive ? '無効化' : '有効化'}
          </button>
          <button
            onClick={handleExpand}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium rounded-lg transition-colors"
          >
            ログ
          </button>
          <button
            onClick={() => onDelete(endpoint.id)}
            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">配信ログ</h4>
          {loadingDeliveries ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : deliveries.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">配信ログがありません</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {deliveries.map((delivery) => (
                <DeliveryRow key={delivery.id} delivery={delivery} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = async () => {
    try {
      const data = await webhookService.getAll();
      setEndpoints(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Webhookの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await webhookService.delete(id);
      toast.success('Webhookを削除しました');
      setEndpoints((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || '削除に失敗しました');
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const updated = await webhookService.update(id, { isActive: !currentActive });
      setEndpoints((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive: updated.isActive } : e)),
      );
      toast.success(`Webhookを${updated.isActive ? '有効化' : '無効化'}しました`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="mb-6 sm:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Webhook</h2>
            <p className="mt-1 text-sm text-gray-500">
              イベント発生時に外部URLへ通知を送信します
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <a
              href="/dashboard/webhooks/new"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </a>
          </div>
        </div>
      </div>

      {endpoints.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Webhookが登録されていません</h3>
          <p className="text-xs text-gray-500 mb-4">最初のWebhookエンドポイントを追加してください</p>
          <a
            href="/dashboard/webhooks/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Webhookを追加
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
