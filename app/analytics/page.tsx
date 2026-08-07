"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminFetch } from "@/lib/admin-api";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { BarChart3 } from "lucide-react";

interface TimePoint {
  date: string;
  count: number;
}

interface AnalyticsData {
  signups: TimePoint[];
  projects: TimePoint[];
  extractions: TimePoint[];
  aiCalls: TimePoint[];
}

function MiniChart({ data, color, label }: { data: TimePoint[]; color: string; label: string }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{total}</span>
      </div>
      <div className="flex items-end gap-1 h-20">
        {data.map((point, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1"
            title={`${point.date}: ${point.count}`}
          >
            <div
              className={`w-full rounded-t transition-all ${color}`}
              style={{ height: `${Math.max((point.count / maxCount) * 100, 4)}%`, minHeight: "2px" }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        <span>{data.length > 0 ? data[0].date : ""}</span>
        <span>{data.length > 0 ? data[data.length - 1].date : ""}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchAnalytics() {
      try {
        setError("");
        const res = await adminFetch(`/api/admin/analytics?days=${period}`);
        const payload = (await res.json()) as AnalyticsData & { error?: string };
        if (!res.ok) throw new Error(payload.error || "Failed to load analytics.");
        setData({
          signups: payload.signups || [],
          projects: payload.projects || [],
          extractions: payload.extractions || [],
          aiCalls: payload.aiCalls || [],
        });
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setLoadingData(false);
      }
    }

    fetchAnalytics();
  }, [admin, period, reloadToken]);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;
  if (!data) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        </div>
        <div className="p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
          {error || "Failed to load analytics."}
        </div>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => {
            setLoadingData(true);
            setError("");
            setReloadToken((n) => n + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => { setPeriod(d); setLoadingData(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === d
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniChart data={data.signups} color="bg-blue-500" label="User Signups" />
        <MiniChart data={data.projects} color="bg-green-500" label="Projects Created" />
        <MiniChart data={data.extractions} color="bg-purple-500" label="Extractions" />
        <MiniChart data={data.aiCalls} color="bg-amber-500" label="AI API Calls" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Daily Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Signups</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Projects</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500 dark:text-gray-400">Extractions</th>
                <th className="text-right px-3 py-2 font-medium text-gray-500 dark:text-gray-400">AI Calls</th>
              </tr>
            </thead>
            <tbody>
              {data.signups.slice(-14).reverse().map((_, i) => {
                const idx = data.signups.length - 1 - i;
                return (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{data.signups[idx]?.date}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{data.signups[idx]?.count || 0}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{data.projects[idx]?.count || 0}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{data.extractions[idx]?.count || 0}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{data.aiCalls[idx]?.count || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
