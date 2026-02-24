"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.user.role !== "CUSTOMER") {
        authService.logout();
        setError(
          "このページは採用企業担当者専用です。RPOスタッフは /login をご利用ください。",
        );
        return;
      }
      router.push("/portal/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">採用企業ポータル</h2>
          <p className="mt-1 text-sm text-gray-500">
            自社の採用状況を確認・管理できます
          </p>
        </div>

        {/* フォームカード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
            >
              パスワードをお忘れの方はこちら
            </a>
          </div>

          <div className="mt-4 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">
              デモアカウント
            </p>
            <div className="bg-teal-50 rounded-xl p-3 text-xs text-teal-800 text-center space-y-0.5">
              <p className="font-medium">customer@demo.com</p>
              <p className="text-teal-600">password123</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            RPOスタッフの方はこちら →
          </a>
        </div>
      </div>
    </div>
  );
}
