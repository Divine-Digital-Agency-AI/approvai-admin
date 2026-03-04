"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { BarChart3, TrendingUp, Users, FolderKanban, Cpu } from "lucide-react";

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

function groupByDay(rows: { created_at: string }[], days: number = 30): TimePoint[] {
  const now = new Date();
  const buckets: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    buckets[key] = 0;
  }

  for (const row of rows) {
    const key = new Date(row.created_at).toISOString().split("T")[0];
    if (key in buckets) {
      buckets[key]++;
    }
  }

  return Object.entries(buckets).map(([date, count]) => ({
    date: `${date.slice(5, 7)}/${date.slice(8, 10)}`,
    count,
  }));
}

export default function AnalyticsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchAnalytics() {
      try {
        const since = new Date();
        since.setDate(since.getDate() - period);
        const sinceStr = since.toISOString();

        const [signupsRes, projectsRes, extractionsRes, aiRes] = await Promise.all([
          supabase.from("profiles").select("created_at").gte("created_at", sinceStr),
          supabase.from("projects").select("created_at").gte("created_at", sinceStr),
          supabase.from("extractions").select("created_at").gte("created_at", sinceStr),
          supabase.from("ai_usage_log").select("created_at").gte("created_at", sinceStr).then(
            (res) => (res.error?.code === "42P01" ? { data: [], error: null } : res)
          ),
        ]);

        setData({
          signups: groupByDay(signupsRes.data || [], period),
          projects: groupByDay(projectsRes.data || [], period),
          extractions: groupByDay(extractionsRes.data || [], period),
          aiCalls: groupByDay((aiRes as { data: { created_at: string }[] | null }).data || [], period),
        });
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchAnalytics();
  }, [admin, period]);

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData || !data) return <TableSkeleton />;

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
