"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isManager()) {
      router.push("/dashboard");
    }
  }, [router]);

  const [settings, setSettings] = useState({
    companyName: "RPO株式会社",
    email: "contact@rpo-company.com",
    timezone: "Asia/Tokyo",
    language: "ja",
    notificationEmail: true,
    notificationSlack: false,
    autoApproval: false,
    aiTextGeneration: true,
    aiImageGeneration: true,
    maxJobsPerMonth: 50,
  });

  const handleSave = () => {
    toast.success("設定を保存しました");
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="px-4 sm:px-0 max-w-3xl">
      {/* ページタイトル */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">システム設定</h2>
        <p className="mt-1 text-sm text-gray-500">
          アプリケーション全体の設定を管理します
        </p>
      </div>

      <div className="space-y-5">
        {/* 基本情報 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">基本情報</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className={labelClass}>会社名</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>メールアドレス</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>タイムゾーン</label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="Asia/Tokyo">日本 (Asia/Tokyo)</option>
                  <option value="America/New_York">ニューヨーク</option>
                  <option value="Europe/London">ロンドン</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>言語</label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">通知設定</h2>
          </div>
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">メール通知</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  重要なイベントをメールで受け取る
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notificationEmail: !settings.notificationEmail,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationEmail ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationEmail
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">Slack通知</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Slackに通知を送信する
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notificationSlack: !settings.notificationSlack,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationSlack ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationSlack
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* AI機能 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">AI機能</h2>
          </div>
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  AIテキスト生成
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  求人テキストの自動生成を有効にする
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    aiTextGeneration: !settings.aiTextGeneration,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.aiTextGeneration ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.aiTextGeneration
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">AI画像生成</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  求人画像の自動生成を有効にする
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    aiImageGeneration: !settings.aiImageGeneration,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.aiImageGeneration ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.aiImageGeneration
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">自動承認</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  AI生成コンテンツを自動承認する
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    autoApproval: !settings.autoApproval,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoApproval ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoApproval ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 利用制限 */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">利用制限</h2>
          </div>
          <div className="px-5 py-5">
            <div>
              <label className={labelClass}>月間最大求人作成数</label>
              <input
                type="number"
                value={settings.maxJobsPerMonth}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxJobsPerMonth: parseInt(e.target.value),
                  })
                }
                className={inputClass}
              />
              <p className="mt-2 text-xs text-gray-500">
                現在の使用量: 12 / {settings.maxJobsPerMonth}件
              </p>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
}
