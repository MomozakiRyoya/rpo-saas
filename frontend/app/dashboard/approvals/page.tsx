'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { approvalService } from '@/lib/services';
import { Approval } from '@/types';

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const response = await approvalService.getAll();
      setApprovals(response.data.filter(a => a.status === 'PENDING'));
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setActionLoading(true);
    try {
      await approvalService.approve(selectedApproval.id, comment);
      alert('承認が完了しました');
      setSelectedApproval(null);
      setComment('');
      loadApprovals();
    } catch (err: any) {
      alert(err.response?.data?.message || '承認に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !comment) {
      alert('差戻しの理由を入力してください');
      return;
    }
    setActionLoading(true);
    try {
      await approvalService.reject(selectedApproval.id, comment);
      alert('差戻しが完了しました');
      setSelectedApproval(null);
      setComment('');
      loadApprovals();
    } catch (err: any) {
      alert(err.response?.data?.message || '差戻しに失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="px-4 sm:px-0">読み込み中...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">承認待ち一覧</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {approvals.length === 0 ? (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  承認待ちの求人はありません
                </li>
              ) : (
                approvals.map((approval) => (
                  <li
                    key={approval.id}
                    className={`px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 ${
                      selectedApproval?.id === approval.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {approval.job?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {approval.job?.customer?.name}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <p className="text-xs text-gray-500">
                          {new Date(approval.requestedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {selectedApproval && (
          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  承認詳細
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      求人タイトル
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApproval.job?.title}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      顧客企業
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApproval.job?.customer?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      コメント（任意）
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="承認または差戻しのコメント"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {actionLoading ? '処理中...' : '承認'}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {actionLoading ? '処理中...' : '差戻し'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
