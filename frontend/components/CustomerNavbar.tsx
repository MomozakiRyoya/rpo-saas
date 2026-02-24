"use client";

import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/auth";
import { useEffect, useState } from "react";
import { User } from "@/types";

const NAV_SECTIONS = [
  {
    label: "メインメニュー",
    items: [
      {
        href: "/portal/dashboard",
        label: "ダッシュボード",
        exact: true,
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      {
        href: "/portal/jobs",
        label: "求人一覧",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      },
      {
        href: "/portal/approvals",
        label: "承認",
        icon: (
          <svg
            className="w-4 h-4"
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
        ),
      },
      {
        href: "/portal/analytics",
        label: "アナリティクス",
        icon: (
          <svg
            className="w-4 h-4"
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
        ),
      },
    ],
  },
];

export default function CustomerNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/portal/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" id="portal-sidebar-inner">
      <style>{`
        #portal-sidebar-inner,
        #portal-sidebar-inner * {
          color: white !important;
        }
        #portal-sidebar-inner .nav-inactive {
          color: rgba(255,255,255,0.8) !important;
        }
        #portal-sidebar-inner .nav-section-label {
          color: rgba(255,255,255,0.5) !important;
        }
      `}</style>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-teal-700/50">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
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
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm truncate leading-tight">
              顧客ポータル
            </h1>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0"></span>
              <span className="text-white text-xs truncate opacity-70">
                {user?.tenantName || "読み込み中..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
                        active ? "bg-white/20" : "hover:bg-white/10"
                      }`}
                      style={{
                        color: active ? "#ffffff" : "rgba(255,255,255,0.85)",
                      }}
                    >
                      <span
                        style={{
                          color: active ? "#ffffff" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ユーザーフッター */}
      <div className="border-t border-teal-700/50 p-3">
        <div className="flex items-center space-x-2 mb-2 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              {user?.name}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              採用企業担当者
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-white/10 text-sm transition-all duration-150 cursor-pointer"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-teal-700 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* モバイルヘッダー */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-teal-700 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
          <span className="text-white font-bold text-sm">顧客ポータル</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          aria-label="メニューを開く"
        >
          {mobileOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* モバイルサイドバー */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-teal-700 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
