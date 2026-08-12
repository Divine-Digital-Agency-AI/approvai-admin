"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Input from "@/components/shared/Input";
import Pagination from "@/components/shared/Pagination";
import { Mail, Search, RefreshCw } from "lucide-react";
import {
  adminEmptyState,
  adminMuted,
  adminTableWrap,
} from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface EmailLogRow {
  id: string;
  user_id: string | null;
  to_email: string;
  from_email: string | null;
  reply_to: string | null;
  kind: string;
  subject: string | null;
  project_id: string | null;
  blueprint_id: string | null;
  resend_message_id: string | null;
  error: string | null;
  sent_at: string;
}

const PAGE_SIZE = 25;

const KINDS = [
  "all",
  "password_reset",
  "thank_you",
  "report_ready",
  "followup_d7",
  "followup_d14",
  "followup_d21",
  "vendor_supplier",
  "support_escalation",
  "subscription_active",
  "payment_failed",
] as const;

const KIND_LABEL: Record<string, string> = {
  password_reset: "Password reset",
  thank_you: "Thank you",
  report_ready: "Report ready",
  followup_d7: "Follow-up (7d)",
  followup_d14: "Follow-up (14d)",
  followup_d21: "Follow-up (21d)",
  vendor_supplier: "Vendor share",
  support_escalation: "Support request",
  subscription_active: "Subscription",
  payment_failed: "Payment failed",
};

function shortAddress(value: string | null): string {
  if (!value) return "—";
  const match = value.match(/<([^>]+)>/);
  return match?.[1] ?? value;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function EmailsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [kindFilter, debouncedSearch]);

  const fetchEmails = useCallback(async () => {
    setLoadingData(true);
    setError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error("Your admin session expired. Please sign in again.");
      }

      const offset = (currentPage - 1) * PAGE_SIZE;
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (kindFilter !== "all") params.set("kind", kindFilter);
      if (debouncedSearch) params.set("q", debouncedSearch);

      const response = await fetch(`/api/admin/emails?${params}`, {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      const result = (await response.json()) as {
        emails?: EmailLogRow[];
        total?: number;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error || "Failed to load emails.");
      }
      setEmails(result.emails ?? []);
      setTotal(result.total ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load emails.";
      setError(message);
      setEmails([]);
      setTotal(0);
    } finally {
      setLoadingData(false);
    }
  }, [currentPage, debouncedSearch, kindFilter]);

  useEffect(() => {
    if (!admin) return;
    void fetchEmails();
  }, [admin, fetchEmails, refreshKey]);

  if (loading || !admin) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white sm:text-2xl">
            <Mail className="h-6 w-6 text-[#1f81df]" strokeWidth={1.75} />
            Sent emails
          </h1>
          <p className={cn(adminMuted, "mt-1")}>
            Every message logged from Resend — from address, kind, and delivery status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f0f0] dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#262626]"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search to, from, or subject…"
            className="rounded-[10px] border-[#d4d4d4] bg-white pl-9 dark:border-[#333333] dark:bg-[#1a1a1a]"
          />
        </div>
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-[#1a1a1a] dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-white"
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k === "all" ? "All kinds" : KIND_LABEL[k] ?? k}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loadingData ? (
        <TableSkeleton rows={8} />
      ) : emails.length === 0 ? (
        <div className={adminEmptyState}>No emails logged yet.</div>
      ) : (
        <div className={adminTableWrap}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f7f7f7] text-xs uppercase tracking-wide text-[#666666] dark:bg-[#0d0d0d] dark:text-[#999999]">
              <tr>
                <th className="px-4 py-3 font-medium">Sent</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#333333]">
              {emails.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-[#666666] dark:text-[#7f7f7f]">
                    {formatWhen(row.sent_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-[#1f81df]/10 px-2 py-0.5 text-xs font-medium text-[#1f81df]">
                      {KIND_LABEL[row.kind] ?? row.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#1a1a1a] dark:text-white">
                    <div className="font-medium">{shortAddress(row.from_email)}</div>
                    {row.reply_to && (
                      <div className="text-xs text-[#999999]">
                        reply-to {shortAddress(row.reply_to)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#1a1a1a] dark:text-white">{row.to_email}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-[#1a1a1a] dark:text-white">
                    {row.subject || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.error ? (
                      <span
                        className="inline-flex rounded-full bg-red-400/15 px-2 py-0.5 text-xs font-medium text-red-500"
                        title={row.error}
                      >
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Sent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
