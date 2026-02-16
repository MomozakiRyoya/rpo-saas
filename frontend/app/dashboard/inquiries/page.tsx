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
        content: '高橋様\\n\\nお問い合わせありがとうございます。\\n\\n弊社では、育児中の社員を積極的に支援しており、時短勤務やフレックスタイム制度の利用が可能です。また、お子様の急な病気等にも柔軟に対応できる体制を整えております。\\n\\n詳細については、面接時に人事担当よりご説明させていただきます。\\n\\nよろしくお願いいたします。',
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

const statusStyles: Record<string, { gradient: string; text: string; icon: string; label: string }> = {
  RECEIVED: {
    gradient: 'from-blue-100 to-cyan-100',
    text: 'text-blue-700',
    icon: '📬',
    label: '受信済み',
  },
  DRAFT_READY: {
    gradient: 'from-sky-100 to-blue-100',
    text: 'text-sky-700',
    icon: '✍️',
    label: '返信案あり',
  },
  SENT: {
    gradient: 'from-green-100 to-emerald-100',
    text: 'text-green-700',
    icon: '✅',
    label: '返信済み',
  },
};

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
      setInquiries(data && data.length > 0 ? data : sampleInquiries);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
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
      toast.success('返信を送信しました');
      loadInquiries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || '送信に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          問い合わせ一覧
        </h1>
        <p className="text-gray-600 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>応募者からの問い合わせに対応します</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Inquiries List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  問い合わせリスト
                </h3>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                  {inquiries.length} 件
                </span>
              </div>
            </div>
            <ul role="list" className="divide-y divide-slate-100">
              {inquiries.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium">問い合わせはありません</p>
                </li>
              ) : (
                inquiries.map((inquiry, index) => {
                  const statusStyle = statusStyles[inquiry.status] || statusStyles.RECEIVED;
                  return (
                    <li
                      key={inquiry.id}
                      className={`px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 ${
                        selectedInquiry?.id === inquiry.id
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500'
                          : ''
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                      style={{
                        animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 p-2 rounded-lg">
                              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-gray-900 truncate">
                                {inquiry.applicantName || '名無し'}
                              </p>
                              <p className="text-xs text-slate-500 font-medium truncate">
                                {inquiry.job?.title || '求人未指定'}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 ml-11">
                            {inquiry.content}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusStyle.gradient} ${statusStyle.text}`}>
                            <span className="mr-1">{statusStyle.icon}</span>
                            {statusStyle.label}
                          </span>
                          <p className="text-xs text-slate-400">
                            {new Date(inquiry.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* Inquiry Detail Panel */}
        {selectedInquiry ? (
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 sticky top-6">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  問い合わせ詳細
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl">
                  <label className="block text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">
                    応募者名
                  </label>
                  <p className="text-sm font-black text-slate-900">
                    {selectedInquiry.applicantName || '-'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-xl">
                  <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    メールアドレス
                  </label>
                  <p className="text-sm font-black text-slate-900 break-all">
                    {selectedInquiry.applicantEmail || '-'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    問い合わせ内容
                  </label>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">
                    {selectedInquiry.content}
                  </p>
                </div>
                {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      返信案
                    </label>
                    {selectedInquiry.responses.map((response: any) => (
                      <div key={response.id} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                        <p className="text-sm text-slate-900 whitespace-pre-wrap mb-3">
                          {response.content}
                        </p>
                        {!response.isSent ? (
                          <button
                            onClick={() => handleSend(response.id)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            送信する
                          </button>
                        ) : (
                          <div className="flex items-center justify-center py-2 text-green-700 font-bold">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            送信済み
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleGenerateResponse}
                  disabled={generating}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      返信案生成
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">問い合わせを選択してください</h3>
              <p className="text-xs text-slate-500">左側から確認する問い合わせをクリックします</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
