'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { inquiryService } from '@/lib/services';
import { Inquiry } from '@/types';
import toast from 'react-hot-toast';

// サンプルデータ
const sampleInquiries: Inquiry[] = [
  {
    id: 'sample-1',
    applicantName: '田中 太郎',
    applicantEmail: 'tanaka@example.com',
    content: 'フルスタックエンジニアの求人について、在宅勤務の可否を教えていただけますでしょうか。また、使用する技術スタックの詳細についても知りたいです。',
    category: '求人内容',
    status: 'RECEIVED',
    source: 'indeed',
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
    source: 'kyujin-box',
    candidateId: 'candidate-1',
    candidate: { id: 'candidate-1', name: '佐藤 花子', email: 'sato.hanako@example.com' },
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
    source: 'direct',
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
    source: 'indeed',
    publication: {
      id: 'pub-1',
      connector: { id: 'conn-1', name: 'Indeed Japan', type: 'indeed' },
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-1', title: 'フルスタックエンジニア' },
    responses: [
      {
        id: 'res-1',
        content: '高橋様\n\nお問い合わせありがとうございます。\n\n弊社では、育児中の社員を積極的に支援しており、時短勤務やフレックスタイム制度の利用が可能です。',
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
    source: 'kyujin-box',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job: { id: 'job-4', title: 'ジュニアエンジニア' },
    responses: [],
  },
];

const statusBadge: Record<string, { className: string; label: string }> = {
  RECEIVED: { className: 'bg-blue-100 text-blue-700', label: '受信済み' },
  DRAFT_READY: { className: 'bg-indigo-100 text-indigo-700', label: '返信案あり' },
  SENT: { className: 'bg-emerald-100 text-emerald-700', label: '返信済み' },
};

const sourceBadge: Record<string, { className: string; label: string }> = {
  indeed: { className: 'bg-blue-600 text-white', label: 'Indeed' },
  'kyujin-box': { className: 'bg-orange-500 text-white', label: '求人ボックス' },
  direct: { className: 'bg-gray-200 text-gray-700', label: '直接' },
};

function SourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  const badge = sourceBadge[source];
  if (!badge) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function ConnectorBadge({ publication }: { publication?: Inquiry['publication'] }) {
  if (!publication?.connector) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {publication.connector.name} 経由で返信可
    </span>
  );
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    loadInquiries();
  }, [statusFilter, sourceFilter]);

  const loadInquiries = async () => {
    try {
      const data = await inquiryService.getAll({
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });
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
      const updated = await inquiryService.getAll();
      setInquiries(updated && updated.length > 0 ? updated : sampleInquiries);
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

  const filteredInquiries = inquiries;

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">問い合わせ一覧</h2>
            <p className="mt-1 text-sm text-gray-500">応募者からの問い合わせに対応します</p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* フィルタバー */}
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全ステータス</option>
            <option value="RECEIVED">受信済み</option>
            <option value="DRAFT_READY">返信案あり</option>
            <option value="SENT">返信済み</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">全媒体</option>
            <option value="indeed">Indeed</option>
            <option value="kyujin-box">求人ボックス</option>
            <option value="direct">直接</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Inquiries List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">問い合わせリスト</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {filteredInquiries.length} 件
              </span>
            </div>

            <ul role="list" className="divide-y divide-gray-100">
              {filteredInquiries.length === 0 ? (
                <li className="px-5 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">問い合わせはありません</p>
                </li>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const badge = statusBadge[inquiry.status] || statusBadge.RECEIVED;
                  return (
                    <li
                      key={inquiry.id}
                      className={`px-5 py-4 cursor-pointer transition-colors ${
                        selectedInquiry?.id === inquiry.id
                          ? 'bg-indigo-50 border-l-2 border-indigo-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex items-start justify-between min-w-0">
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {inquiry.applicantName || '名無し'}
                              </p>
                              <SourceBadge source={inquiry.source} />
                              {inquiry.candidateId && (
                                <Link
                                  href={`/dashboard/candidates/${inquiry.candidateId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  候補者
                                </Link>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-1">
                              {inquiry.job?.title || '求人未指定'}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {inquiry.content}
                            </p>
                            {inquiry.publication?.connector && (
                              <div className="mt-1.5">
                                <ConnectorBadge publication={inquiry.publication} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-1 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                          <p className="text-xs text-gray-400 whitespace-nowrap">
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
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden sticky top-4 lg:top-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">問い合わせ詳細</span>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">応募者名</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedInquiry.applicantName || '-'}
                    </p>
                    <SourceBadge source={selectedInquiry.source} />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">メールアドレス</label>
                  <p className="text-sm font-semibold text-gray-900 break-all">
                    {selectedInquiry.applicantEmail || '-'}
                  </p>
                </div>

                {selectedInquiry.candidateId && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <label className="block text-xs font-medium text-indigo-600 mb-2">候補者</label>
                    <Link
                      href={`/dashboard/candidates/${selectedInquiry.candidateId}`}
                      className="inline-flex items-center text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {selectedInquiry.candidate?.name || selectedInquiry.applicantName || '候補者詳細を見る'}
                      <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}

                {selectedInquiry.publication?.connector && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <label className="block text-xs font-medium text-purple-600 mb-1">返信方法</label>
                    <ConnectorBadge publication={selectedInquiry.publication} />
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">問い合わせ内容</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {selectedInquiry.content}
                  </p>
                </div>

                {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">返信案</label>
                    {selectedInquiry.responses.map((response) => (
                      <div key={response.id} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap mb-3 break-words">
                          {response.content}
                        </p>
                        {!response.isSent ? (
                          <button
                            onClick={() => handleSend(response.id)}
                            className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            送信する
                          </button>
                        ) : (
                          <div className="flex items-center justify-center py-2 text-emerald-700 font-medium text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">問い合わせを選択してください</h3>
              <p className="text-xs text-gray-500">左側から確認する問い合わせをクリックします</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
