"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { userManagementService } from "@/lib/services";
import { User } from "@/types";
import toast from "react-hot-toast";

type InviteForm = {
  name: string;
  email: string;
  password: string;
  role: "MANAGER" | "MEMBER";
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  MEMBER: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(
    null,
  );
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });
  const [inviteErrors, setInviteErrors] = useState<Partial<InviteForm>>({});

  useEffect(() => {
    if (!authService.isManager()) {
      router.push("/dashboard");
      return;
    }
    setCurrentUser(authService.getCurrentUser());
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const data = await userManagementService.getAll();
      setUsers(data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "ユーザー一覧の取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  const validateInviteForm = (): boolean => {
    const errors: Partial<InviteForm> = {};
    if (!inviteForm.name.trim()) errors.name = "氏名を入力してください";
    if (!inviteForm.email.trim()) {
      errors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      errors.email = "有効なメールアドレスを入力してください";
    }
    if (!inviteForm.password) {
      errors.password = "パスワードを入力してください";
    } else if (inviteForm.password.length < 6) {
      errors.password = "パスワードは6文字以上で入力してください";
    }
    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInviteForm()) return;

    setInviteLoading(true);
    try {
      await userManagementService.invite(inviteForm);
      toast.success("メンバーを招待しました");
      setShowInviteModal(false);
      setInviteForm({ name: "", email: "", password: "", role: "MEMBER" });
      setInviteErrors({});
      loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join("、") : msg || "招待に失敗しました",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole: "MANAGER" | "MEMBER" =
      currentRole === "MANAGER" ? "MEMBER" : "MANAGER";
    setRoleChangeLoading(userId);
    try {
      await userManagementService.updateRole(userId, newRole);
      toast.success("役割を変更しました");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "役割の変更に失敗しました");
    } finally {
      setRoleChangeLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await userManagementService.delete(userId);
      toast.success("メンバーを削除しました");
      setDeleteConfirmId(null);
      loadUsers();
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

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ユーザー管理</h2>
            <p className="mt-1 text-sm text-gray-500">
              チームメンバーの招待・役割変更・削除を管理します
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>メンバーを招待</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              チームメンバー
            </span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {users.length} 名
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  役割
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    メンバーがいません
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#4A154B] rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {u.name?.charAt(0) ?? "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {u.name}
                        </span>
                        {u.id === currentUser?.id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            あなた
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE_CLASSES[u.role] || "bg-gray-100 text-gray-600"}`}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {u.id ? new Date().toLocaleDateString("ja-JP") : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {/* 自分自身とADMINは役割変更・削除不可 */}
                        {u.id !== currentUser?.id && u.role !== "ADMIN" && (
                          <>
                            <button
                              onClick={() => handleRoleChange(u.id, u.role)}
                              disabled={roleChangeLoading === u.id}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              {roleChangeLoading === u.id
                                ? "変更中..."
                                : u.role === "MANAGER"
                                  ? "MEMBERに変更"
                                  : "MANAGERに変更"}
                            </button>
                            {deleteConfirmId === u.id ? (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleDelete(u.id)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                  削除確認
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                  キャンセル
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(u.id)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                削除
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                メンバーを招待
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, name: e.target.value })
                  }
                  placeholder="山田 太郎"
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {inviteErrors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {inviteErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  placeholder="member@company.com"
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {inviteErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {inviteErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={inviteForm.password}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, password: e.target.value })
                  }
                  placeholder="6文字以上"
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
                {inviteErrors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {inviteErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役割
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as "MANAGER" | "MEMBER",
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                >
                  <option value="MEMBER">MEMBER（一般ユーザー）</option>
                  <option value="MANAGER">MANAGER（管理者）</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {inviteLoading ? "招待中..." : "招待する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
