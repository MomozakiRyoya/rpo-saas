'use client';

import { useEffect, useState } from 'react';
import { candidateATSService, jobService } from '@/lib/services';
import { CandidateATS, ApplicationStage, Job } from '@/types';
import toast from 'react-hot-toast';

const STAGES: { value: ApplicationStage; label: string; color: string }[] = [
  { value: 'SCREENING', label: 'スクリーニング', color: 'bg-gray-100 text-gray-700' },
  { value: 'FIRST_INTERVIEW', label: '一次面接', color: 'bg-blue-100 text-blue-700' },
  { value: 'SECOND_INTERVIEW', label: '二次面接', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'OFFER', label: 'オファー', color: 'bg-amber-100 text-amber-700' },
  { value: 'HIRED', label: '採用', color: 'bg-emerald-100 text-emerald-700' },
];

interface CandidateWithStage extends CandidateATS {
  applicationId?: string;
  currentStage?: ApplicationStage;
}

interface StageChangeModalProps {
  candidate: CandidateWithStage;
  onClose: () => void;
  onStageChange: (candidateId: string, applicationId: string, stage: ApplicationStage) => Promise<void>;
}

function StageChangeModal({ candidate, onClose, onStageChange }: StageChangeModalProps) {
  const [selectedStage, setSelectedStage] = useState<ApplicationStage>(
    candidate.currentStage ?? 'SCREENING',
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!candidate.applicationId) {
      toast.error('アプリケーションIDが見つかりません');
      return;
    }
    setSaving(true);
    try {
      await onStageChange(candidate.id, candidate.applicationId, selectedStage);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.16)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            ステージを変更: {candidate.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-2">
          {STAGES.map((stage) => (
            <button
              key={stage.value}
              onClick={() => setSelectedStage(stage.value)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border-2 ${
                selectedStage === stage.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? '更新中...' : '変更する'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState<CandidateWithStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithStage | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadCandidates(selectedJobId);
    } else {
      setCandidates([]);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const response = await jobService.getAll({ limit: 100 });
      setJobs(response.data);
    } catch {
      toast.error('求人一覧の取得に失敗しました');
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadCandidates = async (jobId: string) => {
    setLoading(true);
    try {
      const response = await candidateATSService.getAll({ jobId });
      const items: CandidateWithStage[] = response.data.map((c) => {
        const app = c.applications?.find((a) => a.jobId === jobId);
        return {
          ...c,
          applicationId: app?.id,
          currentStage: app?.stage ?? 'SCREENING',
        };
      });
      setCandidates(items);
    } catch {
      toast.error('候補者の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (
    candidateId: string,
    applicationId: string,
    stage: ApplicationStage,
  ) => {
    try {
      await candidateATSService.updateStage(applicationId, stage);
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, currentStage: stage } : c,
        ),
      );
      toast.success('ステージを更新しました');
    } catch {
      toast.error('ステージの更新に失敗しました');
    }
  };

  const getCandidatesForStage = (stage: ApplicationStage) =>
    candidates.filter((c) => c.currentStage === stage);

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kanbanボード</h2>
            <p className="mt-1 text-sm text-gray-500">
              求人ごとに候補者の選考ステージを管理します
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            求人を選択
          </label>
          {loadingJobs ? (
            <div className="w-full sm:w-64 h-10 bg-gray-100 animate-pulse rounded-xl" />
          ) : (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full sm:w-64 border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white text-gray-900"
            >
              <option value="">求人を選択してください</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!selectedJobId ? (
        <div
          className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">求人を選択してください</h3>
          <p className="text-xs text-gray-500">上のドロップダウンから求人を選ぶとKanbanボードが表示されます</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 text-sm">読み込み中...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageCandidates = getCandidatesForStage(stage.value);
              return (
                <div
                  key={stage.value}
                  className="w-64 flex-shrink-0"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${stage.color}`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[200px]">
                    {stageCandidates.length === 0 ? (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                        <p className="text-xs text-gray-400">候補者なし</p>
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                        >
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-700 font-bold text-xs">
                                {candidate.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {candidate.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {candidate.email}
                              </p>
                            </div>
                          </div>

                          {candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {candidate.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{candidate.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="w-full inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            ステージを変更
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedCandidate && (
        <StageChangeModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  );
}
