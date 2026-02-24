'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { webhookService } from '@/lib/services';
import toast from 'react-hot-toast';

const AVAILABLE_EVENTS = [
  { value: 'job.approved', label: '求人承認', description: '求人が承認されたとき' },
  { value: 'job.rejected', label: '求人却下', description: '求人が却下されたとき' },
  { value: 'job.published', label: '求人掲載', description: '求人が掲載されたとき' },
  { value: 'job.stopped', label: '求人停止', description: '求人の掲載が停止されたとき' },
  { value: 'inquiry.received', label: '問い合わせ受信', description: '新しい問い合わせが届いたとき' },
  { value: 'schedule.confirmed', label: '日程確定', description: '面接日程が確定されたとき' },
];

export default function NewWebhookPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; events?: string }>({});

  const validate = (): boolean => {
    const newErrors: { url?: string; events?: string } = {};
    if (!url.trim()) {
      newErrors.url = 'URLは必須です';
    } else {
      try {
        new URL(url);
      } catch {
        newErrors.url = '有効なURLを入力してください（https://で始まるURL）';
      }
    }
    if (selectedEvents.length === 0) {
      newErrors.events = '少なくとも1つのイベントを選択してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
    if (errors.events) {
      setErrors((prev) => ({ ...prev, events: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await webhookService.create({ url, events: selectedEvents });
      toast.success('Webhookを作成しました');
      router.push('/dashboard/webhooks');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Webhookを新規作成</h2>
        <p className="mt-1 text-sm text-gray-500">
          イベント発生時に通知を送信するエンドポイントを設定します
        </p>
      </div>

      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#F5F3FF' }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: '#7C3AED' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">エンドポイント設定</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errors.url) setErrors((prev) => ({ ...prev, url: '' }));
                }}
                placeholder="https://your-service.com/webhook"
                className={`w-full border rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-gray-900 ${
                  errors.url ? 'border-rose-400' : 'border-gray-200'
                }`}
              />
              {errors.url && (
                <p className="mt-1 text-xs text-rose-600">{errors.url}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                POSTリクエストでJSONペイロードが送信されます
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                イベント <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event.value}
                    className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedEvents.includes(event.value)
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {event.label}
                      </p>
                      <p className="text-xs text-gray-500">{event.description}</p>
                      <code className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        {event.value}
                      </code>
                    </div>
                  </label>
                ))}
              </div>
              {errors.events && (
                <p className="mt-2 text-xs text-rose-600">{errors.events}</p>
              )}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? '作成中...' : 'Webhookを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
