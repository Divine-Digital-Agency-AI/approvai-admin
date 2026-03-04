"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import ConfirmModal from "@/components/shared/ConfirmModal";
import InviteUserModal from "@/components/shared/InviteUserModal";
import Button from "@/components/shared/Button";
import Pagination, { usePagination } from "@/components/shared/Pagination";
import { Search, Users as UsersIcon, Shield, ChevronDown, FolderKanban, Trash2, UserPlus } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string;
  projectCount?: number;
}

const ROLES = ["user", "admin", "super_admin"] as const;

export default function UsersPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: projectCounts } = await supabase
        .from("projects")
        .select("user_id");

      const countMap: Record<string, number> = {};
      for (const p of projectCounts || []) {
        countMap[p.user_id] = (countMap[p.user_id] || 0) + 1;
      }

      setUsers(
        (data || []).map((u) => ({
          ...u,
          projectCount: countMap[u.user_id] || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!admin) return;
    fetchUsers();
  }, [admin]);

  const handleRoleChange = async (userId: string, profileId: string, newRole: string) => {
    try {
      const roleValue = newRole === "user" ? null : newRole;
      await supabase.from("profiles").update({ role: roleValue }).eq("id", profileId);
      setUsers((prev) =>
        prev.map((u) => (u.id === profileId ? { ...u, role: roleValue } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    }
    setEditingRole(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supabase.from("projects").delete().eq("user_id", deleteTarget.user_id);
      await supabase.from("profiles").delete().eq("id", deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (u.email || "").toLowerCase().includes(q) ||
      (u.first_name || "").toLowerCase().includes(q) ||
      (u.last_name || "").toLowerCase().includes(q);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "user" && !u.role) ||
      u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const { currentPage, setCurrentPage, paginatedItems, totalItems, pageSize } = usePagination(filtered);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const roleCounts = users.reduce((acc, u) => {
    const r = u.role || "user";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} users</span>
          <Button size="sm" icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInvite(true)}>
            Create User
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "user", "admin", "super_admin"].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === role
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {role === "all"
              ? `All (${users.length})`
              : `${role.replace("_", " ")} (${roleCounts[role] || 0})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Projects</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((user) => (
              <>
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email || "—"}</td>
                  <td className="px-4 py-3">
                    {editingRole === user.id ? (
                      <select
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs"
                        value={user.role || "user"}
                        onChange={(e) => handleRoleChange(user.user_id, user.id, e.target.value)}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (admin.role === "super_admin") setEditingRole(user.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === "admin" || user.role === "super_admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        } ${admin.role === "super_admin" ? "hover:ring-1 hover:ring-primary/30 cursor-pointer" : ""}`}
                        title={admin.role === "super_admin" ? "Click to change role" : ""}
                      >
                        {user.role === "admin" || user.role === "super_admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : null}
                        {user.role || "user"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <FolderKanban className="w-3 h-3" />
                      {user.projectCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {admin.role === "super_admin" && user.user_id !== admin.authUser.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(user);
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedUser === user.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </td>
                </tr>
                {expandedUser === user.id && (
                  <tr key={`${user.id}-detail`} className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">User ID</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{user.user_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Profile ID</span>
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{user.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Projects</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user.projectCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block text-xs">Member Since</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {search ? "No users match your search." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      <InviteUserModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onUserCreated={fetchUsers}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.email || "this user"}</strong>? This will also
            remove all their projects. This action cannot be undone.
          </>
        }
        confirmLabel="Delete User"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
