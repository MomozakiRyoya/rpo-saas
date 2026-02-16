'use client';

import { useEffect, useState } from 'react';
import { inquiryService } from '@/lib/services';
import toast from 'react-hot-toast';

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

// サンプルデータ
const sampleInquiries: Inquiry[] = [
  {
    id: 'sample-1',
    applicantName: '田中 太郎',
    applicantEmail: 'tanaka@example.com',
    content: 'フルスタックエンジニアの求人について、在宅勤務の可否を教えていただけますでしょうか。また、使用する技術スタックの詳細についても知りたいです。',
    category: '求人内容',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-1', title: 'フルスタックエンジニア' },
    responses: [],
  },
  {
    id: 'sample-2',
    applicantName: '佐藤 花子',
    applicantEmail: 'sato.hanako@example.com',
    content: '面接の日程について、来週の火曜日または水曜日での調整は可能でしょうか？現在の勤務先との兼ね合いで、平日午後の時間帯を希望しております。',
    category: '面接日程',
    status: 'DRAFT_READY',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-2', title: 'Reactエンジニア' },
    responses: [],
  },
  {
    id: 'sample-3',
    applicantName: '鈴木 一郎',
    applicantEmail: 'suzuki.ichiro@example.com',
    content: '給与体系について詳しく教えていただきたいです。基本給の他に、どのような手当が含まれているのでしょうか。また、賞与の支給実績についても知りたいです。',
    category: '給与・待遇',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-3', title: 'バックエンドエンジニア' },
    responses: [],
  },
  {
    id: 'sample-4',
    applicantName: '高橋 美咲',
    applicantEmail: 'takahashi.misaki@example.com',
    content: '育児中のため、時短勤務やフレックスタイム制度の利用は可能でしょうか。また、子供の急な病気などに対応できる体制について教えてください。',
    category: '勤務条件',
    status: 'SENT',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-1', title: 'フルスタックエンジニア' },
    responses: [
      {
        id: 'res-1',
        content: '高橋様\n\nお問い合わせありがとうございます。\n\n弊社では、育児中の社員を積分支援しており、時短勤務やフレックスタイム制度の利用が可能です。また、お子様の急な病気等にも柔軟に対応できる体制を整えております。\n\n詳細については、面接時に人事担当よりご説明させていただきます。\n\nよろしくお願いいたします。',
        isSent: true,
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'sample-5',
    applicantName: '山田 健太',
    applicantEmail: 'yamada.kenta@example.com',
    content: '未経験からのキャリアチェンジを考えています。研修制度やOJTの内容、メンター制度の有無について詳しく教えていただけますでしょうか。',
    category: '研修・育成',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-4', title: 'ジュニアエンジニア' },
    responses: [],
  },
];

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
      // データがない場合はサンプルデータを使用
      setInquiries(data && data.length > 0 ? data : sampleInquiries);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      // エラー時はサンプルデータを表示
      setInquiries(sampleInquiries);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!selectedInquiry) return;
    setGenerating(true);
    try {
      await inquiryService.generateResponse(selectedInquiry.id);
      toast.success('返信案を生成しました');
      loadInquiries();
      const updated = await inquiryService.getAll();
      const found = updated.find((i: Inquiry) => i.id === selectedInquiry.id);
      if (found) setSelectedInquiry(found);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '返信案生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async (responseId: string) => {
    if (!selectedInquiry || !confirm('返信を送信しますか？')) return;
    try {
      await inquiryService.send(selectedInquiry.id, responseId);
      toast.success('返信を送信しました（モック）');
      loadInquiries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '送信に失敗しました');
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
