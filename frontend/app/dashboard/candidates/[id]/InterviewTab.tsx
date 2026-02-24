'use client';

import { useEffect, useState } from 'react';
import { interviewService } from '@/lib/services';
import { InterviewLog } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  candidateId: string;
}

interface AddForm {
  scheduledAt: string;
  type: 'phone' | 'video' | 'onsite';
  result: 'pass' | 'fail' | 'pending';
  notes: string;
}

const EMPTY_FORM: AddForm = {
  scheduledAt: '',
  type: 'phone',
  result: 'pending',
  notes: '',
};

const typeLabels: Record<string, string> = {
  phone: '電話面談',
  video: 'ビデオ面談',
  onsite: '対面面談',
};

const resultStyles: Record<string, string> = {
  pass: 'bg-emerald-100 text-emerald-700',
  fail: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
};

const resultLabels: Record<string, string> = {
  pass: '通過',
  fail: '不合格',
  pending: '未決定',
};

export default function InterviewTab({ candidateId }: Props) {
  const [interviews, setInterviews] = useState<InterviewLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, [candidateId]);

  const loadInterviews = async () => {
    try {
      const data = await interviewService.getAll(candidateId);
      setInterviews(data);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduledAt) {
      toast.error('日時を入力してください');
      return;
    }
    setSaving(true);
    try {
      const created = await interviewService.create({
        candidateId,
        scheduledAt: form.scheduledAt,
        type: form.type,
        result: form.result,
        notes: form.notes || undefined,
      });
      setInterviews((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('面談を追加しました');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '面談の追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この面談ログを削除しますか？')) return;
    try {
      await interviewService.delete(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      toast.success('面談ログを削除しました');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">面談ログ</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          面談を追加
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4"
        >
          <h4 className="text-sm font-semibold text-indigo-900">面談を追加</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">日時</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">種類</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as AddForm['type'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="phone">電話面談</option>
                <option value="video">ビデオ面談</option>
                <option value="onsite">対面面談</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">結果</label>
              <select
                value={form.result}
                onChange={(e) => setForm((p) => ({ ...p, result: e.target.value as AddForm['result'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">未決定</option>
                <option value="pass">通過</option>
                <option value="fail">不合格</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="面談の詳細や所感..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '追加する'
              )}
            </button>
          </div>
        </form>
      )}

      {interviews.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">面談ログはまだありません</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">日時</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">求人</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">種類</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">結果</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">メモ</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-gray-900 font-medium">
                      {new Date(interview.scheduledAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[120px] truncate">
                      {interview.job?.title ?? '-'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {typeLabels[interview.type] ?? interview.type}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${resultStyles[interview.result] ?? resultStyles.pending}`}>
                        {resultLabels[interview.result] ?? interview.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">
                      {interview.notes ?? '-'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(interview.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        aria-label="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
