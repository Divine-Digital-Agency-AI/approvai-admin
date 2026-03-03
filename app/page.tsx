"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Users, FolderKanban, Building2, FileSearch, MailPlus, AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalMunicipalities: number;
  totalBlueprints: number;
  earlyAccessCount: number;
  failedExtractions: number;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
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

export default function AdminDashboard() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
        const [usersRes, projectsRes, municipalitiesRes, blueprintsRes, failedRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("projects").select("id", { count: "exact", head: true }),
          supabase.from("municipalities").select("id", { count: "exact", head: true }),
          supabase.from("blueprints").select("id", { count: "exact", head: true }),
          supabase.from("blueprints").select("id", { count: "exact", head: true }).eq("status", "error"),
        ]);

        let earlyAccessCount = 0;
        try {
          const earlyRes = await supabase.from("early_access_emails").select("id", { count: "exact", head: true });
          earlyAccessCount = earlyRes.count ?? 0;
        } catch {
          // Table may not exist yet
        }

        setStats({
          totalUsers: usersRes.count ?? 0,
          totalProjects: projectsRes.count ?? 0,
          totalMunicipalities: municipalitiesRes.count ?? 0,
          totalBlueprints: blueprintsRes.count ?? 0,
          earlyAccessCount,
          failedExtractions: failedRes.count ?? 0,
        });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <StatCard label="Municipalities" value={stats.totalMunicipalities} icon={Building2} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <StatCard label="Blueprints" value={stats.totalBlueprints} icon={FileSearch} color="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" />
        <StatCard label="Early Access List" value={stats.earlyAccessCount} icon={MailPlus} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard label="Failed Extractions" value={stats.failedExtractions} icon={AlertTriangle} color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
      </div>
    </div>
  );
}
