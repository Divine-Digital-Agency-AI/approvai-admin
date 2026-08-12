"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminFetch } from "@/lib/admin-api";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Button from "@/components/shared/Button";
import { adminMuted, adminTableWrap } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  trade: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  sort_order: number;
  is_active: boolean;
}

export default function PreferredTradesPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [newTrade, setNewTrade] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  const load = async () => {
    setLoadingData(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/preferred-trades");
      const payload = (await res.json()) as { trades?: Trade[]; error?: string };
      if (!res.ok) throw new Error(payload.error || "Failed to load trades.");
      setTrades(payload.trades || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trades.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!admin) return;
    void load();
  }, [admin]);

  const patch = async (id: string, body: Partial<Trade>) => {
    setSavingId(id);
    setError("");
    try {
      const res = await adminFetch("/api/admin/preferred-trades", {
        method: "PATCH",
        body: JSON.stringify({ id, ...body }),
      });
      const payload = (await res.json()) as { trade?: Trade; error?: string };
      if (!res.ok) throw new Error(payload.error || "Save failed.");
      if (payload.trade) {
        setTrades((prev) => prev.map((t) => (t.id === id ? payload.trade! : t)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingId(null);
    }
  };

  const add = async () => {
    const trade = newTrade.trim();
    if (!trade) return;
    setError("");
    try {
      const res = await adminFetch("/api/admin/preferred-trades", {
        method: "POST",
        body: JSON.stringify({ trade }),
      });
      const payload = (await res.json()) as { trade?: Trade; error?: string };
      if (!res.ok) throw new Error(payload.error || "Add failed.");
      if (payload.trade) setTrades((prev) => [...prev, payload.trade!]);
      setNewTrade("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add failed.");
    }
  };

  const remove = async (id: string) => {
    setError("");
    try {
      const res = await adminFetch(`/api/admin/preferred-trades?id=${id}`, { method: "DELETE" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || "Delete failed.");
      setTrades((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading || !admin) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1a1a1a] dark:text-white">Preferred trades</h1>
        <p className={cn(adminMuted, "mt-1")}>
          Rows with a company, contact, email, or phone appear in the D.3 vendor email. Empty
          rows are omitted so we never send fake numbers.
        </p>
      </div>
      {error && (
        <div className="rounded-[10px] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="max-w-xs flex-1 rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 text-sm dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-white"
          placeholder="New trade name"
          value={newTrade}
          onChange={(e) => setNewTrade(e.target.value)}
        />
        <Button type="button" onClick={() => void add()}>
          Add
        </Button>
      </div>
      {loadingData ? (
        <TableSkeleton />
      ) : (
        <div className={adminTableWrap}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f7f7f7] text-xs uppercase tracking-wide text-[#666666] dark:bg-[#0d0d0d] dark:text-[#999999]">
              <tr>
                <th className="px-3 py-2">On</th>
                <th className="px-3 py-2">Trade</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#333333]">
              {trades.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={t.is_active}
                      disabled={savingId === t.id}
                      onChange={(e) => void patch(t.id, { is_active: e.target.checked })}
                    />
                  </td>
                  {(["trade", "company", "contact", "email", "phone"] as const).map((field) => (
                    <td key={field} className="px-2 py-2">
                      <input
                        className="w-full min-w-[7rem] rounded-[8px] border border-[#d4d4d4] bg-white px-2 py-1 dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
                        defaultValue={t[field]}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value !== t[field]) void patch(t.id, { [field]: value });
                        }}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={() => void remove(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
