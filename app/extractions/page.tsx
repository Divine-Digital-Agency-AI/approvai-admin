"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import Pagination, { usePagination } from "@/components/shared/Pagination";
import { Search, Cpu, Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface AiUsageEntry {
  id: string;
  blueprint_id: string | null;
  extraction_id: string | null;
  user_id: string | null;
  ai_model: string;
  provider: string;
  operation: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  latency_ms: number | null;
  status: string;
  error_message: string | null;
  pages_processed: number | null;
  cost_estimate: number | null;
  created_at: string;
}

interface UsageStats {
  totalCalls: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
}

function StatsBar({ stats }: { stats: UsageStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <Cpu className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Calls</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalCalls}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <Clock className="w-5 h-5 text-amber-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Latency</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.avgLatency > 0 ? `${(stats.avgLatency / 1000).toFixed(1)}s` : "—"}
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
        <Zap className="w-5 h-5 text-purple-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Tokens</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.totalTokens > 0 ? stats.totalTokens.toLocaleString() : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExtractionsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<AiUsageEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchUsage() {
      try {
        const { data, error } = await supabase
          .from("ai_usage_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);

        if (error) {
          if (error.code === "42P01") {
            setEntries([]);
          } else {
            throw error;
          }
        } else {
          setEntries(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch AI usage:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchUsage();
  }, [admin]);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.ai_model.toLowerCase().includes(search.toLowerCase()) ||
      e.provider.toLowerCase().includes(search.toLowerCase()) ||
      (e.error_message || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { currentPage, setCurrentPage, paginatedItems, totalItems, pageSize } = usePagination(filtered);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  const stats: UsageStats = {
    totalCalls: entries.length,
    successRate: entries.length > 0 ? (entries.filter((e) => e.status === "success").length / entries.length) * 100 : 0,
    avgLatency: entries.length > 0
      ? entries.reduce((sum, e) => sum + (e.latency_ms || 0), 0) / entries.filter((e) => e.latency_ms).length || 0
      : 0,
    totalTokens: entries.reduce((sum, e) => sum + (e.total_tokens || 0), 0),
  };

  const statusCounts = entries.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Usage & Extractions</h1>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} entries</span>
      </div>

      <StatsBar stats={stats} />

      <div className="flex flex-wrap gap-2">
        {["all", "success", "error"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? `All (${entries.length})` : `${status} (${statusCounts[status] || 0})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by model, provider, or error..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Model</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Pages</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Tokens</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Latency</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Error</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                    {entry.ai_model}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    entry.status === "success"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}>
                    {entry.status === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                  {entry.pages_processed ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-mono text-xs">
                  {entry.total_tokens ? entry.total_tokens.toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {entry.latency_ms ? `${(entry.latency_ms / 1000).toFixed(1)}s` : "—"}
                </td>
                <td className="px-4 py-3 text-red-400 max-w-[200px] truncate text-xs">
                  {entry.error_message && (
                    <span title={entry.error_message}>{entry.error_message}</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {entries.length === 0
                    ? "No AI usage data yet. Extractions will be logged here automatically."
                    : "No entries match your filters."}
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
    </div>
  );
}
