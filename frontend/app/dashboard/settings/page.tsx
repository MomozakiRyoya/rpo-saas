'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'RPO株式会社',
    email: 'contact@rpo-company.com',
    timezone: 'Asia/Tokyo',
    language: 'ja',
    notificationEmail: true,
    notificationSlack: false,
    autoApproval: false,
    aiTextGeneration: true,
    aiImageGeneration: true,
    maxJobsPerMonth: 50,
  });

  const handleSave = () => {
    toast.success('設定を保存しました');
  };

  return (
    <div className="px-4 sm:px-0 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">システム設定</h1>
      <p className="text-gray-600 mb-8">アプリケーション全体の設定を管理します</p>

      <div className="space-y-6">
        {/* 基本設定 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              基本情報
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイムゾーン
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="Asia/Tokyo">日本 (Asia/Tokyo)</option>
                  <option value="America/New_York">ニューヨーク</option>
                  <option value="Europe/London">ロンドン</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  言語
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              通知設定
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">メール通知</p>
                <p className="text-sm text-gray-500">重要なイベントをメールで受け取る</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notificationEmail: !settings.notificationEmail })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationEmail ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationEmail ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Slack通知</p>
                <p className="text-sm text-gray-500">Slackに通知を送信する</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notificationSlack: !settings.notificationSlack })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationSlack ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationSlack ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* AI機能設定 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI機能
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">AIテキスト生成</p>
                <p className="text-sm text-gray-500">求人テキストの自動生成を有効にする</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, aiTextGeneration: !settings.aiTextGeneration })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.aiTextGeneration ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.aiTextGeneration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">AI画像生成</p>
                <p className="text-sm text-gray-500">求人画像の自動生成を有効にする</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, aiImageGeneration: !settings.aiImageGeneration })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.aiImageGeneration ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.aiImageGeneration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">自動承認</p>
                <p className="text-sm text-gray-500">AI生成コンテンツを自動承認する</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoApproval: !settings.autoApproval })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoApproval ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 利用制限 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              利用制限
            </h2>
          </div>
          <div className="px-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月間最大求人作成数
              </label>
              <input
                type="number"
                value={settings.maxJobsPerMonth}
                onChange={(e) => setSettings({ ...settings, maxJobsPerMonth: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                現在の使用量: 12 / {settings.maxJobsPerMonth}件
              </p>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 transition-all shadow-md"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  );
}
