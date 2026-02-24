"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import api from "@/lib/api";

interface NotificationSummary {
  pendingApprovals: number;
  newInquiries: number;
  total: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<NotificationSummary | null>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<NotificationSummary>(
        "/api/notifications/summary",
      );
      setNotifications(res.data);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: {
            style: {
              background: "#fff",
              color: "#1d1c1d",
              borderLeft: "4px solid #2EB67D",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1d1c1d",
              borderLeft: "4px solid #E01E5A",
            },
          },
        }}
      />

      {/* サイドバー */}
      <Navbar />

      {/* メインコンテンツ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* トップバー */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shrink-0 shadow-sm">
          <div className="flex items-center flex-1 max-w-lg">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="RPO-SaaSを検索..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A154B]/30 focus:border-[#4A154B]/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            {/* 通知ベル */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="通知"
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
                {notifications && notifications.total > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {notifications.total > 9 ? "9+" : notifications.total}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">通知</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <a
                      href="/dashboard/approvals"
                      onClick={() => setShowNotifDropdown(false)}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          承認待ち
                        </p>
                        <p className="text-xs text-gray-500">
                          {notifications?.pendingApprovals ?? 0}
                          件の承認申請があります
                        </p>
                      </div>
                      {notifications && notifications.pendingApprovals > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                          {notifications.pendingApprovals}
                        </span>
                      )}
                    </a>
                    <a
                      href="/dashboard/inquiries"
                      onClick={() => setShowNotifDropdown(false)}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          新着問い合わせ
                        </p>
                        <p className="text-xs text-gray-500">
                          {notifications?.newInquiries ?? 0}件の未対応があります
                        </p>
                      </div>
                      {notifications && notifications.newInquiries > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {notifications.newInquiries}
                        </span>
                      )}
                    </a>
                  </div>
                  {notifications?.total === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-400">
                        未対応の通知はありません
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="ヘルプ"
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto pt-[52px] lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
