"use client";

import { useEffect, useRef, useState } from "react";
import { resumeService } from "@/lib/services";
import { Resume } from "@/types";
import toast from "react-hot-toast";

interface Props {
  candidateId: string;
}

export default function ResumeTab({ candidateId }: Props) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error("Failed to load resumes:", err);
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
      toast.success("職務経歴書を生成しました");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "AI生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const newResume = await resumeService.upload(candidateId, file);
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResume(newResume);
      setEditContent(newResume.content);
      setDirty(false);
      setShowOriginal(false);
      toast.success("履歴書をAIで修正しました");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "アップロードに失敗しました");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!selectedResume) return;
    setSaving(true);
    try {
      const updated = await resumeService.update(selectedResume.id, editContent);
      setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedResume(updated);
      setDirty(false);
      toast.success("職務経歴書を保存しました");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectResume = (resume: Resume) => {
    if (dirty && !confirm("変更が保存されていません。破棄しますか？")) return;
    setSelectedResume(resume);
    setEditContent(resume.content);
    setDirty(false);
    setShowOriginal(false);
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
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-900">職務経歴書</h3>
        <div className="flex items-center gap-2">
          {/* ファイルアップロード */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || generating}
            className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI修正中...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                履歴書アップロード
              </>
            )}
          </button>
          {/* AI生成 */}
          <button
            onClick={handleGenerate}
            disabled={generating || uploading}
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
      </div>

      {/* アップロード説明 */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-emerald-700">
          <span className="font-semibold">履歴書アップロード</span>でPDF・Word・テキストファイルをAIが自動で添削・改善します。修正前の原文も保存されます。
        </p>
      </div>

      {/* バージョン選択 */}
      {resumes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectResume(r)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                selectedResume?.id === r.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
              }`}
            >
              {r.uploadedFileName && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              v{r.version}
              {r.uploadedFileName && <span className="opacity-70 truncate max-w-[80px]">{r.uploadedFileName}</span>}
            </button>
          ))}
        </div>
      )}

      {/* メインコンテンツ */}
      {selectedResume ? (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* カードヘッダー */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">バージョン {selectedResume.version}</span>
              {selectedResume.uploadedFileName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  AI修正済み
                </span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(selectedResume.updatedAt).toLocaleDateString("ja-JP")}
              </span>
              {dirty && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                  未保存
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 原文表示トグル */}
              {selectedResume.originalContent && (
                <button
                  onClick={() => setShowOriginal((v) => !v)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    showOriginal
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showOriginal ? "AI修正版を表示" : "原文を表示"}
                </button>
              )}
              {dirty && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "保存中..." : "保存する"}
                </button>
              )}
            </div>
          </div>

          {/* アップロードファイル名 */}
          {selectedResume.uploadedFileName && (
            <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs text-emerald-700">元ファイル: {selectedResume.uploadedFileName}</span>
              <span className="text-xs text-emerald-500 ml-1">| AIが内容を解析・修正しました</span>
            </div>
          )}

          {/* 本文 */}
          <div className="p-5">
            {showOriginal && selectedResume.originalContent ? (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">原文（アップロード時の内容）</p>
                <pre className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[480px]">
                  {selectedResume.originalContent}
                </pre>
              </div>
            ) : (
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
            )}
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
          <p className="text-xs text-gray-400">「履歴書アップロード」でAI修正、または「AI生成」で自動作成できます</p>
        </div>
      )}
    </div>
  );
}
