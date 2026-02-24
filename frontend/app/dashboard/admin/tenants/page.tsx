'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { adminService } from '@/lib/services';
import toast from 'react-hot-toast';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: { users: number };
};

export default function AdminTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', slug: '' });
  const [createErrors, setCreateErrors] = useState<{ name?: string; slug?: string }>({});

  useEffect(() => {
    if (!authService.isAdmin()) {
      router.push('/dashboard');
      return;
    }
    loadTenants();
  }, [router]);

  const loadTenants = async () => {
    try {
      const data = await adminService.getAllTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'テナント一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 40);

  const handleNameChange = (name: string) => {
    setCreateForm({ name, slug: generateSlug(name) });
  };

  const validateCreateForm = (): boolean => {
    const errors: { name?: string; slug?: string } = {};
    if (!createForm.name.trim()) errors.name = 'テナント名を入力してください';
    if (!createForm.slug.trim()) {
      errors.slug = 'スラッグを入力してください';
    } else if (!/^[a-z0-9-]+$/.test(createForm.slug)) {
      errors.slug = 'スラッグは半角英数字とハイフンのみ使用できます';
    }
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setCreateLoading(true);
    try {
      await adminService.createTenant({ name: createForm.name, slug: createForm.slug });
      toast.success('テナントを作成しました');
      setShowCreateForm(false);
      setCreateForm({ name: '', slug: '' });
      setCreateErrors({});
      loadTenants();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('、') : msg || 'テナントの作成に失敗しました');
    } finally {
      setCreateLoading(false);
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

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                ADMIN専用
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">テナント一覧</h2>
            <p className="mt-1 text-sm text-gray-500">プラットフォーム全体のテナントを管理します</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>テナントを作成</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3F0FF', color: '#7C3AED' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">新規テナント作成</span>
          </div>
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  テナント名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="株式会社サンプル"
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {createErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スラッグ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="sample-company"
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {createErrors.slug && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.slug}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setCreateErrors({}); }}
                className="py-2 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {createLoading ? '作成中...' : 'テナントを作成'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tenants Table */}
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3F0FF', color: '#7C3AED' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">テナント一覧</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            {tenants.length} テナント
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">テナント名</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">スラッグ</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ユーザー数</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">作成日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-500">
                    テナントがありません
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {tenant.name?.charAt(0) ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{tenant.slug}</code>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {tenant._count?.users ?? '-'} 名
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('ja-JP') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
