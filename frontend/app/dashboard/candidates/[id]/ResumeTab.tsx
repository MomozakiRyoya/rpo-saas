'use client';

import { useEffect, useState } from 'react';
import { resumeService } from '@/lib/services';
import { Resume } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  candidateId: string;
}

export default function ResumeTab({ candidateId }: Props) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadResumes();
  }, [candidateId]);

  const loadResumes = async () => {
    try {
      const data = await resumeService.getAll(candidateId);
      setResumes(data);
      if (data.length > 0) {
        const latest = data.reduce((a, b) => (a.version > b.version ? a : b));
        setSelectedResume(latest);
        setEditContent(latest.content);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newResume = await resumeService.generate(candidateId);
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResume(newResume);
      setEditContent(newResume.content);
      setDirty(false);
      toast.success('職務経歴書を生成しました');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedResume) return;
    setSaving(true);
    try {
      const updated = await resumeService.update(selectedResume.id, editContent);
      setResumes((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedResume(updated);
      setDirty(false);
      toast.success('職務経歴書を保存しました');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectResume = (resume: Resume) => {
    if (dirty && !confirm('変更が保存されていません。破棄しますか？')) return;
    setSelectedResume(resume);
    setEditContent(resume.content);
    setDirty(false);
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
        <h3 className="text-sm font-semibold text-gray-900">職務経歴書</h3>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI生成
            </>
          )}
        </button>
      </div>

      {resumes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectResume(r)}
              className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                selectedResume?.id === r.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
              }`}
            >
              v{r.version}
            </button>
          ))}
        </div>
      )}

      {selectedResume ? (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">
                バージョン {selectedResume.version}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(selectedResume.updatedAt).toLocaleDateString('ja-JP')}
              </span>
              {dirty && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                  未保存
                </span>
              )}
            </div>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存する'}
              </button>
            )}
          </div>
          <div className="p-5">
            <textarea
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                setDirty(true);
              }}
              rows={20}
              className="w-full text-sm text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono leading-relaxed"
              placeholder="職務経歴書の内容..."
            />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">職務経歴書がありません</p>
          <p className="text-xs text-gray-400">「AI生成」ボタンで自動生成できます</p>
        </div>
      )}
    </div>
  );
}
