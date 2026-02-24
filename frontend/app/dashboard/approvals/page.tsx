"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { approvalService } from "@/lib/services";
import { authService } from "@/lib/auth";
import { Approval } from "@/types";
import toast from "react-hot-toast";

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const response = await approvalService.getAll();
      setApprovals(response.data.filter((a) => a.status === "PENDING"));
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setActionLoading(true);
    try {
      await approvalService.approve(selectedApproval.id, comment);
      toast.success("承認が完了しました");
      setSelectedApproval(null);
      setComment("");
      loadApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "承認に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !comment) {
      toast.error("差戻しの理由を入力してください");
      return;
    }
    setActionLoading(true);
    try {
      await approvalService.reject(selectedApproval.id, comment);
      toast.success("差戻しが完了しました");
      setSelectedApproval(null);
      setComment("");
      loadApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "差戻しに失敗しました");
    } finally {
      setActionLoading(false);
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
            <h2 className="text-xl font-bold text-gray-900">承認待ち一覧</h2>
            <p className="mt-1 text-sm text-gray-500">
              レビュー待ちの求人を確認して承認または差戻しを行います
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Approvals List */}
        <div className="lg:col-span-2">
          <div
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            {/* Card Section Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#FFF1F2", color: "#E11D48" }}
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  承認待ちリスト
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {approvals.length} 件
              </span>
            </div>

            <ul
              role="list"
              className={
                viewMode === "grid" ? "divide-y divide-gray-100" : "space-y-0"
              }
            >
              {approvals.length === 0 ? (
                <li className="px-5 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                    <svg
                      className="w-7 h-7 text-gray-400"
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
                  <p className="text-sm text-gray-600 font-medium">
                    承認待ちの求人はありません
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    すべての求人が処理されました
                  </p>
                </li>
              ) : viewMode === "grid" ? (
                approvals.map((approval) => (
                  <li
                    key={approval.id}
                    className={`px-5 py-4 cursor-pointer transition-colors ${
                      selectedApproval?.id === approval.id
                        ? "bg-indigo-50 border-l-2 border-indigo-500"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: "#FFF1F2",
                            color: "#E11D48",
                          }}
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {approval.job?.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {approval.job?.customer?.name}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end space-y-1 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          承認待ち
                        </span>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(approval.requestedAt).toLocaleDateString(
                            "ja-JP",
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                approvals.map((approval, index) => (
                  <li
                    key={approval.id}
                    className={`cursor-pointer transition-colors ${
                      selectedApproval?.id === approval.id
                        ? "bg-indigo-50"
                        : "hover:bg-gray-50"
                    } ${index > 0 ? "border-t border-gray-100" : ""}`}
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate mb-1 sm:mb-0">
                          {approval.job?.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 self-start sm:self-auto flex-shrink-0">
                          承認待ち
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-sm min-w-0">
                          <div className="bg-gray-100 p-1.5 rounded-lg mr-2 flex-shrink-0">
                            <svg
                              className="w-3.5 h-3.5 text-gray-500"
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
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">顧客企業</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {approval.job?.customer?.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-sm min-w-0">
                          <div className="bg-gray-100 p-1.5 rounded-lg mr-2 flex-shrink-0">
                            <svg
                              className="w-3.5 h-3.5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">申請日</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {new Date(
                                approval.requestedAt,
                              ).toLocaleDateString("ja-JP")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Approval Detail Panel */}
        {selectedApproval ? (
          <div className="lg:col-span-1">
            <div
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden sticky top-4 lg:top-6"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              {/* Card Section Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#FFF1F2", color: "#E11D48" }}
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    承認詳細
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    求人タイトル
                  </label>
                  <p className="text-sm font-semibold text-gray-900 break-words">
                    {selectedApproval.job?.title}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    顧客企業
                  </label>
                  <p className="text-sm font-semibold text-gray-900 break-words">
                    {selectedApproval.job?.customer?.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コメント（任意）
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="承認または差戻しのコメントを入力..."
                  />
                </div>
                <div className="flex flex-col space-y-2 pt-2">
                  {authService.isManager() ? (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            処理中...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            承認する
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="w-full inline-flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            処理中...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
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
                            差戻す
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-2">
                      承認待ち
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-7 h-7 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                求人を選択してください
              </h3>
              <p className="text-xs text-gray-500">
                左側から承認する求人をクリックします
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
