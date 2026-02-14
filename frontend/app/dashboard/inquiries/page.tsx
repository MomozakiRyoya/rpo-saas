'use client';

import { useEffect, useState } from 'react';
import { inquiryService } from '@/lib/services';

interface Inquiry {
  id: string;
  content: string;
  applicantName?: string;
  applicantEmail?: string;
  category?: string;
  status: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
  };
  responses?: any[];
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const data = await inquiryService.getAll();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!selectedInquiry) return;
    setGenerating(true);
    try {
      await inquiryService.generateResponse(selectedInquiry.id);
      alert('返信案を生成しました');
      loadInquiries();
      const updated = await inquiryService.getAll();
      const found = updated.find((i: Inquiry) => i.id === selectedInquiry.id);
      if (found) setSelectedInquiry(found);
    } catch (err: any) {
      alert(err.response?.data?.message || '返信案生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async (responseId: string) => {
    if (!selectedInquiry || !confirm('返信を送信しますか？')) return;
    try {
      await inquiryService.send(selectedInquiry.id, responseId);
      alert('返信を送信しました（モック）');
      loadInquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || '送信に失敗しました');
    }
  };

  if (loading) {
    return <div className="px-4 sm:px-0">読み込み中...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">問い合わせ一覧</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {inquiries.length === 0 ? (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  問い合わせはありません
                </li>
              ) : (
                inquiries.map((inquiry) => (
                  <li
                    key={inquiry.id}
                    className={`px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 ${
                      selectedInquiry?.id === inquiry.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {inquiry.applicantName || '名無し'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {inquiry.content.substring(0, 50)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {inquiry.job?.title || '求人未指定'}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">
                          {inquiry.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {selectedInquiry && (
          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  問い合わせ詳細
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      応募者名
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedInquiry.applicantName || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      メールアドレス
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedInquiry.applicantEmail || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      内容
                    </label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedInquiry.content}
                    </p>
                  </div>
                  {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        返信案
                      </label>
                      {selectedInquiry.responses.map((response: any) => (
                        <div key={response.id} className="mt-2 p-3 bg-gray-50 rounded border">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {response.content}
                          </p>
                          {!response.isSent && (
                            <button
                              onClick={() => handleSend(response.id)}
                              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              送信
                            </button>
                          )}
                          {response.isSent && (
                            <p className="mt-2 text-xs text-green-600">送信済み</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleGenerateResponse}
                    disabled={generating}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {generating ? '生成中...' : '返信案生成'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
