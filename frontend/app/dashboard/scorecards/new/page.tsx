'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scorecardService } from '@/lib/services';
import toast from 'react-hot-toast';

interface CriteriaForm {
  name: string;
  weight: string;
  maxScore: string;
}

const EMPTY_CRITERION: CriteriaForm = { name: '', weight: '1', maxScore: '10' };

export default function NewScorecardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState<CriteriaForm[]>([{ ...EMPTY_CRITERION }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'スコアカード名は必須です';
    }
    criteria.forEach((c, i) => {
      if (!c.name.trim()) {
        newErrors[`criteria_${i}_name`] = '評価基準名は必須です';
      }
      const weight = Number(c.weight);
      if (isNaN(weight) || weight <= 0) {
        newErrors[`criteria_${i}_weight`] = '重みは1以上の数値を入力してください';
      }
      const maxScore = Number(c.maxScore);
      if (isNaN(maxScore) || maxScore <= 0) {
        newErrors[`criteria_${i}_maxScore`] = '最大スコアは1以上の数値を入力してください';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCriterion = () => {
    setCriteria((prev) => [...prev, { ...EMPTY_CRITERION }]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length <= 1) {
      toast.error('評価基準は1つ以上必要です');
      return;
    }
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof CriteriaForm, value: string) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
    const errorKey = `criteria_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await scorecardService.create({
        name,
        criteria: criteria.map((c, i) => ({
          name: c.name,
          weight: Number(c.weight),
          maxScore: Number(c.maxScore),
          order: i + 1,
        })),
      });
      toast.success('スコアカードを作成しました');
      router.push('/dashboard/scorecards');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">スコアカードを新規作成</h2>
        <p className="mt-1 text-sm text-gray-500">面接評価基準を定義します</p>
      </div>

      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#FFFBEB' }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: '#D97706' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">スコアカード設定</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スコアカード名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="例: エンジニア一次面接評価"
                className={`w-full border rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-gray-900 ${
                  errors.name ? 'border-rose-400' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  評価基準 <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  基準を追加
                </button>
              </div>

              <div className="space-y-3">
                {criteria.map((criterion, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500">
                        基準 {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          評価基準名
                        </label>
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                          placeholder="例: コミュニケーション能力"
                          className={`w-full border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-gray-900 bg-white ${
                            errors[`criteria_${index}_name`] ? 'border-rose-400' : 'border-gray-200'
                          }`}
                        />
                        {errors[`criteria_${index}_name`] && (
                          <p className="mt-1 text-xs text-rose-600">
                            {errors[`criteria_${index}_name`]}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            重み
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={criterion.weight}
                            onChange={(e) => updateCriterion(index, 'weight', e.target.value)}
                            className={`w-full border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-gray-900 bg-white ${
                              errors[`criteria_${index}_weight`] ? 'border-rose-400' : 'border-gray-200'
                            }`}
                          />
                          {errors[`criteria_${index}_weight`] && (
                            <p className="mt-1 text-xs text-rose-600">
                              {errors[`criteria_${index}_weight`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            最大スコア
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={criterion.maxScore}
                            onChange={(e) => updateCriterion(index, 'maxScore', e.target.value)}
                            className={`w-full border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-gray-900 bg-white ${
                              errors[`criteria_${index}_maxScore`] ? 'border-rose-400' : 'border-gray-200'
                            }`}
                          />
                          {errors[`criteria_${index}_maxScore`] && (
                            <p className="mt-1 text-xs text-rose-600">
                              {errors[`criteria_${index}_maxScore`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? '作成中...' : 'スコアカードを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
