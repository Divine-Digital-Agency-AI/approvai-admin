"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Button from "@/components/shared/Button";
import {
  Settings,
  Shield,
  Server,
  Key,
  Cpu,
  Globe,
  CheckCircle,
  LogOut,
  FileStack,
  Timer,
  Sparkles,
} from "lucide-react";
import {
  adminCardBorder,
  adminMuted,
  adminPagePad,
  adminSectionLabel,
} from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface SystemStatus {
  supabaseUrl: string;
  hasGeniusProKey: boolean;
  extractModel: string;
  formsModel: string;
  qaModel: string;
  judgeModel: string;
  askAntModel: string;
  maxPages: number;
  totalTables: number;
  profilesCount: number;
}

function ConfigTile({
  icon: Icon,
  label,
  value,
  envKey,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  envKey: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-[#d4d4d4] bg-[#f7f7f7] p-4 dark:border-[#333333] dark:bg-[#0d0d0d]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className={cn(adminSectionLabel, "normal-case tracking-normal")}>{label}</span>
      </div>
      <p
        className={cn(
          "text-lg font-semibold tracking-tight text-[#1a1a1a] dark:text-white",
          mono && "truncate font-mono text-sm sm:text-base"
        )}
        title={value}
      >
        {value}
      </p>
      <code className="mt-2 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] text-[#666666] dark:bg-[#1a1a1a] dark:text-[#7f7f7f]">
        {envKey}
      </code>
    </div>
  );
}

export default function SettingsPage() {
  const { admin, loading, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    }
  };

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
          extractModel: "gp-approvai-extract",
          formsModel: "gp-approvai-forms",
          qaModel: "gp-approvai-qa",
          judgeModel: "gp-approvai-judge",
          askAntModel: "gp-approvai-ask-ant",
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
    <div className={cn(adminPagePad, "space-y-6")}>
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white sm:text-2xl">
          Settings
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className={adminCardBorder}>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1a1a1a] dark:text-white">
            <Shield className="h-5 w-5 text-primary" strokeWidth={1.75} />
            Admin Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] py-2 dark:border-[#333333]">
              <span className={adminMuted}>Role</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {admin.role}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#e5e5e5] py-2 dark:border-[#333333]">
              <span className={adminMuted}>Email</span>
              <span className="font-medium text-[#1a1a1a] dark:text-white">{admin.authUser.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className={adminMuted}>User ID</span>
              <span className="font-mono text-xs text-[#666666] dark:text-[#7f7f7f]">{admin.authUser.id}</span>
            </div>
          </div>
          <div className="mt-5 border-t border-[#e5e5e5] pt-4 dark:border-[#333333]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              isLoading={signingOut}
              icon={<LogOut className="h-4 w-4" strokeWidth={1.75} />}
              className="w-full sm:w-auto"
            >
              Sign out
            </Button>
          </div>
        </div>

        <div className={adminCardBorder}>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1a1a1a] dark:text-white">
            <Server className="h-5 w-5 text-primary" strokeWidth={1.75} />
            Infrastructure
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] py-2 dark:border-[#333333]">
              <span className={cn(adminMuted, "flex items-center gap-1.5")}>
                <Globe className="h-3.5 w-3.5" strokeWidth={1.75} /> Supabase
              </span>
              <div className="flex min-w-0 items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.75} />
                <span className="max-w-[200px] truncate font-mono text-xs text-[#666666] dark:text-[#7f7f7f]">
                  {status?.supabaseUrl || "..."}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#e5e5e5] py-2 dark:border-[#333333]">
              <span className={cn(adminMuted, "flex items-center gap-1.5")}>
                <Key className="h-3.5 w-3.5" strokeWidth={1.75} /> GeniusPro API Key
              </span>
              <span className="text-xs text-[#999999]">Set in backend .env</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className={cn(adminMuted, "flex items-center gap-1.5")}>
                <Cpu className="h-3.5 w-3.5" strokeWidth={1.75} /> Users in DB
              </span>
              <span className="font-medium text-[#1a1a1a] dark:text-white">
                {loadingStatus ? "…" : (status?.profilesCount ?? "…")}
              </span>
            </div>
          </div>
        </div>

        <div className={cn(adminCardBorder, "md:col-span-2")}>
          <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#1a1a1a] dark:text-white">
              <Cpu className="h-5 w-5 text-primary" strokeWidth={1.75} />
              Extraction configuration
            </h2>
            <p className={adminMuted}>Read-only values from the API environment.</p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <ConfigTile
              icon={FileStack}
              label="Max pages"
              value={String(status?.maxPages ?? 6)}
              envKey="EXTRACTION_MAX_PAGES"
            />
            <ConfigTile
              icon={Sparkles}
              label="Extract"
              value={status?.extractModel ?? "…"}
              envKey="SWARM_EXTRACT_MODEL"
              mono
            />
            <ConfigTile
              icon={Sparkles}
              label="Forms"
              value={status?.formsModel ?? "…"}
              envKey="SWARM_FORMS_MODEL"
              mono
            />
            <ConfigTile
              icon={Sparkles}
              label="QA"
              value={status?.qaModel ?? "…"}
              envKey="SWARM_QA_MODEL"
              mono
            />
            <ConfigTile
              icon={Sparkles}
              label="Judge"
              value={status?.judgeModel ?? "…"}
              envKey="SWARM_JUDGE_MODEL"
              mono
            />
            <ConfigTile
              icon={Sparkles}
              label="Ask Ant"
              value={status?.askAntModel ?? "…"}
              envKey="ASK_ANT_MODEL"
              mono
            />
            <ConfigTile
              icon={Timer}
              label="API timeout"
              value="120s"
              envKey="geniuspro_service"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
