'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { candidateService } from '@/lib/services';
import { Candidate } from '@/types';
import toast from 'react-hot-toast';
import ProfileTab from './ProfileTab';
import InterviewTab from './InterviewTab';
import ResumeTab from './ResumeTab';

type Tab = 'profile' | 'interviews' | 'resume';

const TAB_CONFIG: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  {
    id: 'profile',
    label: '概要',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'interviews',
    label: '面談ログ',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'resume',
    label: '職務経歴書',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const candidateId = params.id;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  useEffect(() => {
    loadCandidate();
  }, [candidateId]);

  const loadCandidate = async () => {
    try {
      const data = await candidateService.getOne(candidateId);
      setCandidate(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '候補者情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  if (!candidate) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-gray-600 font-medium">候補者が見つかりませんでした</p>
          <Link href="/dashboard/candidates" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const initials = candidate.name ? candidate.name.charAt(0).toUpperCase() : '?';
  const counts = candidate._count ?? { inquiries: 0, interviews: 0, resumes: 0 };

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-5">
        <Link href="/dashboard/candidates" className="hover:text-indigo-600 transition-colors">
          候補者一覧
        </Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{candidate.name || '名前未設定'}</span>
      </nav>

      {/* Candidate Hero */}
      <div
        className="bg-white border border-gray-100 rounded-2xl p-6 mb-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-xl">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">
              {candidate.name || '名前未設定'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {candidate.email && (
                <span className="flex items-center text-sm text-gray-500">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {candidate.email}
                </span>
              )}
              {candidate.phone && (
                <span className="flex items-center text-sm text-gray-500">
                  <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {candidate.phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{counts.inquiries}</div>
              <div className="text-xs text-gray-500">問い合わせ</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{counts.interviews}</div>
              <div className="text-xs text-gray-500">面談</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{counts.resumes}</div>
              <div className="text-xs text-gray-500">経歴書</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-1" aria-label="タブ">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-2.5 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <ProfileTab candidate={candidate} onUpdated={setCandidate} />
        )}
        {activeTab === 'interviews' && (
          <InterviewTab candidateId={candidate.id} />
        )}
        {activeTab === 'resume' && (
          <ResumeTab candidateId={candidate.id} />
        )}
      </div>
    </div>
  );
}
