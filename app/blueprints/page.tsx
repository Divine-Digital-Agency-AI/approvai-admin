"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import { Search, FileSearch, AlertTriangle, RefreshCw } from "lucide-react";

interface Blueprint {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  status: string;
  processing_error: string | null;
  page_count: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  uploaded: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  classifying: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  extracting: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  processed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function BlueprintsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchBlueprints() {
      try {
        const { data, error } = await supabase
          .from("blueprints")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBlueprints(data || []);
      } catch (err) {
        console.error("Failed to fetch blueprints:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchBlueprints();
  }, [admin]);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const filtered = blueprints.filter((b) => {
    const matchesSearch = b.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = blueprints.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSearch className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Blueprints</h1>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} blueprints</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "uploaded", "classifying", "extracting", "processed", "error"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? `All (${blueprints.length})` : `${status} (${statusCounts[status] || 0})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by file name..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">File</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Pages</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Size</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Created</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Error</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((bp) => (
              <tr key={bp.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">
                  {bp.file_name}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[bp.status] || statusColors.uploaded}`}>
                    {bp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{bp.page_count ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {bp.file_size ? `${(bp.file_size / 1024).toFixed(0)} KB` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(bp.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-red-400 max-w-[200px] truncate text-xs">
                  {bp.processing_error && (
                    <span className="flex items-center gap-1" title={bp.processing_error}>
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      {bp.processing_error}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {search || statusFilter !== "all" ? "No blueprints match your filters." : "No blueprints found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
