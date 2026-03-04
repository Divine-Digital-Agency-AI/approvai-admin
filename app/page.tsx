"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import {
  Users, FolderKanban, Building2, FileSearch, MailPlus, AlertTriangle,
  Cpu, TrendingUp, Clock, Activity
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalMunicipalities: number;
  totalBlueprints: number;
  earlyAccessCount: number;
  failedExtractions: number;
  totalExtractions: number;
  successfulExtractions: number;
  totalAiCalls: number;
}

interface RecentActivity {
  id: string;
  type: "user" | "project" | "extraction" | "ai_call";
  label: string;
  detail: string;
  created_at: string;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function SuccessRateBar({ success, total }: { success: number; total: number }) {
  const rate = total > 0 ? (success / total) * 100 : 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Extraction Success Rate</span>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{rate.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${rate}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{success} successful</span>
        <span>{total - success} failed</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/login");
    }
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchStats() {
      try {
        const [usersRes, projectsRes, municipalitiesRes, blueprintsRes, failedRes, extractionsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase.from("municipalities").select("id", { count: "exact", head: true }),
          supabase.from("blueprints").select("id", { count: "exact", head: true }),
          supabase.from("blueprints").select("id", { count: "exact", head: true }).eq("status", "error"),
          supabase.from("extractions").select("id", { count: "exact", head: true }),
        ]);

        const processedRes = await supabase
          .from("blueprints")
          .select("id", { count: "exact", head: true })
          .eq("status", "processed");

        let earlyAccessCount = 0;
        try {
          const earlyRes = await supabase.from("early_access_emails").select("id", { count: "exact", head: true });
          earlyAccessCount = earlyRes.count ?? 0;
        } catch { /* table may not exist */ }

        let totalAiCalls = 0;
        try {
          const aiRes = await supabase.from("ai_usage_log").select("id", { count: "exact", head: true });
          totalAiCalls = aiRes.count ?? 0;
        } catch { /* table may not exist */ }

        setStats({
          totalUsers: usersRes.count ?? 0,
          totalProjects: projectsRes.count ?? 0,
          totalMunicipalities: municipalitiesRes.count ?? 0,
          totalBlueprints: blueprintsRes.count ?? 0,
          earlyAccessCount,
          failedExtractions: failedRes.count ?? 0,
          totalExtractions: extractionsRes.count ?? 0,
          successfulExtractions: processedRes.count ?? 0,
          totalAiCalls,
        });

        const recentItems: RecentActivity[] = [];

        const { data: recentUsers } = await supabase
          .from("profiles")
          .select("id, email, created_at")
          .order("created_at", { ascending: false })
          .limit(3);
        for (const u of recentUsers || []) {
          recentItems.push({
            id: `user-${u.id}`,
            type: "user",
            label: "New user signup",
            detail: u.email || "Unknown",
            created_at: u.created_at,
          });
        }

        const { data: recentProjects } = await supabase
          .from("projects")
          .select("id, name, created_at")
          .order("created_at", { ascending: false })
          .limit(3);
        for (const p of recentProjects || []) {
          recentItems.push({
            id: `project-${p.id}`,
            type: "project",
            label: "Project created",
            detail: p.name,
            created_at: p.created_at,
          });
        }

        const { data: recentExtractions } = await supabase
          .from("extractions")
          .select("id, ai_model_used, created_at")
          .order("created_at", { ascending: false })
          .limit(3);
        for (const e of recentExtractions || []) {
          recentItems.push({
            id: `extraction-${e.id}`,
            type: "extraction",
            label: "Extraction completed",
            detail: e.ai_model_used,
            created_at: e.created_at,
          });
        }

        recentItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setActivity(recentItems.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [admin]);

  if (loading || !admin) return <DashboardSkeleton />;
  if (loadingStats || !stats) return <DashboardSkeleton />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {admin.authUser.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard label="Municipalities" value={stats.totalMunicipalities} icon={Building2} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <StatCard label="Blueprints" value={stats.totalBlueprints} icon={FileSearch} color="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" />
        <StatCard label="AI Extractions" value={stats.totalExtractions} icon={Cpu} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard label="AI API Calls" value={stats.totalAiCalls} icon={TrendingUp} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard label="Early Access" value={stats.earlyAccessCount} icon={MailPlus} color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
        <StatCard label="Failed Extractions" value={stats.failedExtractions} icon={AlertTriangle} color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuccessRateBar
          success={stats.successfulExtractions}
          total={stats.successfulExtractions + stats.failedExtractions}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400">No recent activity.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.type === "user" ? "bg-blue-500" :
                    item.type === "project" ? "bg-green-500" :
                    item.type === "extraction" ? "bg-purple-500" :
                    "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
