"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminFetch } from "@/lib/admin-api";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import {
  Users, FolderKanban, Building2, FileSearch, MailPlus, AlertTriangle,
  Cpu, TrendingUp, Activity
} from "lucide-react";
import { adminCardBorder, adminMuted, adminPagePad, adminSectionLabel } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string }) {
  return (
    <div className={cn(adminCardBorder, "flex items-start justify-between")}>
      <div>
        <p className={adminMuted}>{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white">{value}</p>
      </div>
      <div className={`rounded-[10px] p-2.5 ${color}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
    </div>
  );
}

function SuccessRateBar({ success, total }: { success: number; total: number }) {
  const rate = total > 0 ? (success / total) * 100 : 0;
  return (
    <div className={adminCardBorder}>
      <div className="mb-2 flex items-center justify-between">
        <span className={adminMuted}>Extraction Success Rate</span>
        <span className="text-lg font-semibold text-[#1a1a1a] dark:text-white">{rate.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5] dark:bg-[#333333]">
        <div
          className="h-full rounded-full bg-[#1f81df] transition-all duration-500"
          style={{ width: `${rate}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-[#999999]">
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
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/login");
    }
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchStats() {
      try {
        setStatsError("");
        const res = await adminFetch("/api/admin/stats");
        const payload = (await res.json()) as {
          stats?: {
            totalUsers: number;
            totalProjects: number;
            totalMunicipalities: number;
            totalBlueprints: number;
            aiApiCalls: number;
            failedExtractions: number;
            aiExtractions: number;
            earlyAccessRequests: number;
            successfulExtractions: number;
          };
          recentActivity?: {
            id: string;
            kind: string;
            label: string;
            at: string;
            meta: string | number | null;
          }[];
          error?: string;
        };
        if (!res.ok || !payload.stats) {
          throw new Error(payload.error || "Failed to fetch dashboard stats.");
        }

        setStats({
          totalUsers: payload.stats.totalUsers,
          totalProjects: payload.stats.totalProjects,
          totalMunicipalities: payload.stats.totalMunicipalities,
          totalBlueprints: payload.stats.totalBlueprints,
          earlyAccessCount: payload.stats.earlyAccessRequests,
          failedExtractions: payload.stats.failedExtractions,
          totalExtractions: payload.stats.aiExtractions,
          successfulExtractions: payload.stats.successfulExtractions,
          totalAiCalls: payload.stats.aiApiCalls,
        });

        const kindMap: Record<string, RecentActivity["type"]> = {
          user: "user",
          project: "project",
          extraction: "extraction",
        };
        setActivity(
          (payload.recentActivity || []).slice(0, 8).map((item) => ({
            id: `${item.kind}-${item.id}`,
            type: kindMap[item.kind] || "ai_call",
            label: item.label,
            detail: item.meta == null ? "" : String(item.meta),
            created_at: item.at,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStatsError(err instanceof Error ? err.message : "Failed to load dashboard.");
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [admin]);

  if (loading || !admin) return <DashboardSkeleton />;
  if (loadingStats) return <DashboardSkeleton />;
  if (!stats) {
    return (
      <div className={cn(adminPagePad, "space-y-4")}>
        <h1 className="text-xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
          Dashboard
        </h1>
        <div className="p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
          {statsError || "Failed to load dashboard stats."}
        </div>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => {
            setLoadingStats(true);
            setStatsError("");
            void (async () => {
              try {
                const res = await adminFetch("/api/admin/stats");
                if (!res.ok) throw new Error("Retry failed.");
                window.location.reload();
              } catch (e) {
                setStatsError(e instanceof Error ? e.message : "Retry failed.");
                setLoadingStats(false);
              }
            })();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={cn(adminPagePad, "space-y-6")}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white sm:text-2xl">
          Dashboard
        </h1>
        <p className={cn(adminMuted, "mt-1")}>Welcome back, {admin.authUser.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="bg-primary/10 text-primary" />
        <StatCard label="Municipalities" value={stats.totalMunicipalities} icon={Building2} color="bg-primary/10 text-primary" />
        <StatCard label="Blueprints" value={stats.totalBlueprints} icon={FileSearch} color="bg-primary/10 text-primary" />
        <StatCard label="AI Extractions" value={stats.totalExtractions} icon={Cpu} color="bg-primary/10 text-primary" />
        <StatCard label="AI API Calls" value={stats.totalAiCalls} icon={TrendingUp} color="bg-amber-400/15 text-amber-600 dark:text-amber-400" />
        <StatCard label="Early Access" value={stats.earlyAccessCount} icon={MailPlus} color="bg-primary/10 text-primary" />
        <StatCard label="Failed Extractions" value={stats.failedExtractions} icon={AlertTriangle} color="bg-red-400/15 text-red-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SuccessRateBar
          success={stats.successfulExtractions}
          total={stats.successfulExtractions + stats.failedExtractions}
        />

        <div className={adminCardBorder}>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h3 className={adminSectionLabel}>Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-[#999999]">No recent activity.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      item.type === "user" && "bg-[#1f81df]",
                      item.type === "project" && "bg-emerald-500",
                      item.type === "extraction" && "bg-[#3b9aef]",
                      item.type !== "user" &&
                        item.type !== "project" &&
                        item.type !== "extraction" &&
                        "bg-amber-500"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1a1a1a] dark:text-white">{item.label}</p>
                    <p className="truncate text-xs text-[#666666] dark:text-[#7f7f7f]">{item.detail}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-[#999999]">
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
