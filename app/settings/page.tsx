"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Settings, Shield, Server, Key, Cpu, Globe, CheckCircle, XCircle } from "lucide-react";

interface SystemStatus {
  supabaseUrl: string;
  hasGeniusProKey: boolean;
  geniusProModel: string;
  maxPages: number;
  totalTables: number;
  profilesCount: number;
}

export default function SettingsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    if (!admin) return;

    async function fetchStatus() {
      try {
        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        setStatus({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured",
          hasGeniusProKey: false,
          geniusProModel: "—",
          maxPages: 6,
          totalTables: 0,
          profilesCount: count ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch system status:", err);
      } finally {
        setLoadingStatus(false);
      }
    }

    fetchStatus();
  }, [admin]);

  if (loading || !admin) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400">Role</span>
              <span className="font-medium text-gray-900 dark:text-white px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {admin.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="font-medium text-gray-900 dark:text-white">{admin.authUser.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 dark:text-gray-400">User ID</span>
              <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{admin.authUser.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Infrastructure
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Supabase
              </span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate max-w-[200px]">
                  {status?.supabaseUrl || "..."}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> GeniusPro API Key
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                Set in backend .env
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Users in DB
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {status?.profilesCount ?? "..."}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Extraction Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Max Pages per Extraction</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">6</span>
              <span className="block text-xs text-gray-400 mt-1">EXTRACTION_MAX_PAGES env var</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">AI Model</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white font-mono">approvai-bc219</span>
              <span className="block text-xs text-gray-400 mt-1">GENIUSPRO_CAT_MODEL env var</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">API Timeout</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">120s</span>
              <span className="block text-xs text-gray-400 mt-1">Hardcoded in geniuspro_service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
