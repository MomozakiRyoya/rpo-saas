'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      setError('リセットリンクが無効です。パスワードリセットを再度リクエストしてください。');
    } else {
      setToken(t);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'エラーが発生しました。リンクの有効期限が切れている可能性があります。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新しいパスワードを設定
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            6文字以上のパスワードを入力してください
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-green-800 mb-2">パスワードをリセットしました</h3>
            <p className="text-sm text-green-700">3秒後にログインページへ移動します...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  disabled={!token}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="6文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード（確認）
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  disabled={!token}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="もう一度入力"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '更新中...' : 'パスワードを更新'}
              </button>
            </div>

            <div className="text-sm text-center">
              <a href="/login" className="text-indigo-600 hover:text-indigo-500">
                ログインページに戻る
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
