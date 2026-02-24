"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { customerService, jobService } from "@/lib/services";
import { Customer, Job } from "@/types";
import toast from "react-hot-toast";
import api from "@/lib/api";

const statusLabels: Record<string, string> = {
  DRAFT: "下書き",
  GENERATED: "生成完了",
  PENDING_APPROVAL: "承認待ち",
  APPROVED: "承認済み",
  PUBLISHING: "掲載実行中",
  PUBLISHED: "掲載中",
  PUBLISH_FAILED: "更新失敗",
  STOPPED: "掲載停止",
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  GENERATED: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PUBLISHING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  PUBLISH_FAILED: "bg-rose-100 text-rose-700",
  STOPPED: "bg-gray-100 text-gray-600",
};

interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [showAddPortalUser, setShowAddPortalUser] = useState(false);
  const [portalUserForm, setPortalUserForm] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [addingPortalUser, setAddingPortalUser] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadCustomer();
      loadCustomerJobs();
      loadPortalUsers();
    }
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      const data = await customerService.getOne(params.id as string);
      setCustomer(data);
      setEditForm({ name: data.name, description: data.description || "" });
    } catch (err) {
      console.error("Failed to load customer:", err);
      toast.error("顧客情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerJobs = async () => {
    try {
      const response = await jobService.getAll({
        customerId: params.id as string,
      });
      setJobs(response.data);
    } catch (err) {
      console.error("Failed to load customer jobs:", err);
    }
  };

  const handleUpdate = async () => {
    if (!customer) return;
    try {
      await customerService.update(customer.id, editForm);
      toast.success("顧客情報を更新しました");
      setIsEditing(false);
      loadCustomer();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "更新に失敗しました");
    }
  };

  const loadPortalUsers = async () => {
    try {
      const res = await api.get(`/api/customers/${params.id}/portal-users`);
      setPortalUsers(res.data);
    } catch (err) {
      console.error("Failed to load portal users:", err);
    }
  };

  const handleAddPortalUser = async () => {
    if (
      !portalUserForm.email ||
      !portalUserForm.name ||
      !portalUserForm.password
    ) {
      toast.error("すべての項目を入力してください");
      return;
    }
    setAddingPortalUser(true);
    try {
      await api.post(
        `/api/customers/${params.id}/portal-users`,
        portalUserForm,
      );
      toast.success("ポータルユーザーを追加しました");
      setShowAddPortalUser(false);
      setPortalUserForm({ email: "", name: "", password: "" });
      loadPortalUsers();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "ユーザーの追加に失敗しました",
      );
    } finally {
      setAddingPortalUser(false);
    }
  };

  const handleDelete = async () => {
    if (
      !customer ||
      !confirm(
        "この顧客を削除しますか？\n※関連する求人も削除される可能性があります。",
      )
    )
      return;
    try {
      await customerService.delete(customer.id);
      toast.success("顧客を削除しました");
      router.push("/dashboard/customers");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "削除に失敗しました");
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

  if (!customer) {
    return (
      <div className="px-4 sm:px-6 lg:px-0">
        <div
          className="bg-white border border-gray-100 rounded-2xl p-8 sm:p-12 text-center"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 bg-rose-50">
            <svg
              className="w-7 h-7 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            顧客が見つかりません
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            指定された顧客は存在しないか、削除された可能性があります
          </p>
          <button
            onClick={() => router.push("/dashboard/customers")}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            顧客一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <button
              onClick={() => router.push("/dashboard/customers")}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {customer.name}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                顧客ID: {customer.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  削除
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
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
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: customer.name,
                      description: customer.description || "",
                    });
                  }}
                  className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Customer Info Card */}
        <div className="lg:col-span-1">
          <div
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: "#4F46E5" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                顧客情報
              </span>
            </div>
            <div className="p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      企業名
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      説明
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                      placeholder="顧客企業の説明を入力..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      企業名
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {customer.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      説明
                    </label>
                    <p className="text-sm text-gray-600 break-words">
                      {customer.description || "説明なし"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">登録日</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(customer.createdAt).toLocaleDateString(
                          "ja-JP",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">最終更新</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(customer.updatedAt).toLocaleDateString(
                          "ja-JP",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">求人数</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {jobs.length} 件
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Jobs Card */}
        <div className="lg:col-span-2">
          <div
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#EEF2FF" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "#4F46E5" }}
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
                <span className="text-sm font-semibold text-gray-900">
                  関連求人
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {jobs.length} 件
              </span>
            </div>
            <div className="p-5">
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{ backgroundColor: "#EEF2FF" }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: "#4F46E5" }}
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
                  <p className="text-sm text-gray-500 mb-4">
                    この顧客の求人はまだありません
                  </p>
                  <a
                    href="/dashboard/jobs/new"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    新規求人を作成
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => {
                    const badgeClass =
                      statusStyles[job.status] || "bg-gray-100 text-gray-600";
                    return (
                      <a
                        key={job.id}
                        href={`/dashboard/jobs/${job.id}`}
                        className="group block bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 flex-1 min-w-0 mr-3">
                            {job.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${badgeClass}`}
                          >
                            {statusLabels[job.status]}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 space-x-3">
                          <div className="flex items-center">
                            <svg
                              className="w-3.5 h-3.5 mr-1 flex-shrink-0"
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
                            <span>
                              {new Date(job.updatedAt).toLocaleDateString(
                                "ja-JP",
                              )}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ポータルユーザー管理 */}
      <div className="mt-6">
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-50">
                <svg
                  className="w-5 h-5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ポータルユーザー管理
              </span>
            </div>
            <button
              onClick={() => setShowAddPortalUser(!showAddPortalUser)}
              className="inline-flex items-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-xl transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              ユーザーを追加
            </button>
          </div>

          {/* ユーザー追加フォーム */}
          {showAddPortalUser && (
            <div className="px-5 py-4 border-b border-gray-100 bg-teal-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                新規ポータルユーザー
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    氏名
                  </label>
                  <input
                    type="text"
                    value={portalUserForm.name}
                    onChange={(e) =>
                      setPortalUserForm({
                        ...portalUserForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="担当者名"
                    className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={portalUserForm.email}
                    onChange={(e) =>
                      setPortalUserForm({
                        ...portalUserForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="user@company.com"
                    className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={portalUserForm.password}
                    onChange={(e) =>
                      setPortalUserForm({
                        ...portalUserForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="6文字以上"
                    className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleAddPortalUser}
                  disabled={addingPortalUser}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {addingPortalUser ? "追加中..." : "追加する"}
                </button>
                <button
                  onClick={() => {
                    setShowAddPortalUser(false);
                    setPortalUserForm({ email: "", name: "", password: "" });
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          <div className="p-5">
            {portalUsers.length === 0 ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 bg-teal-50">
                  <svg
                    className="w-5 h-5 text-teal-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">
                  ポータルユーザーはまだいません
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {portalUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
