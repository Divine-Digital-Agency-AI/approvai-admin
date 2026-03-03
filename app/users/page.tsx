"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import { Search, Users as UsersIcon } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role?: string | null;
  created_at: string;
}

export default function UsersPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchUsers();
  }, [admin]);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.email || "").toLowerCase().includes(q) ||
      (u.first_name || "").toLowerCase().includes(q) ||
      (u.last_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Users</h1>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} users</span>
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
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === "admin" || user.role === "super_admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}>
                    {user.role || "user"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {search ? "No users match your search." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
