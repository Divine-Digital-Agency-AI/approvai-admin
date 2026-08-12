"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminFetch } from "@/lib/admin-api";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import Button from "@/components/shared/Button";
import { adminMuted } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  kind: string;
  label: string;
  subject: string;
  body_text: string;
  cta_label: string | null;
  cta_path: string | null;
  enabled: boolean;
  extra_json: Record<string, unknown>;
  updated_at: string;
}

export default function EmailTemplatesPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<string>("thank_you");
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [extraText, setExtraText] = useState("{}");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  const load = async () => {
    setLoadingData(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/email-templates");
      const payload = (await res.json()) as { templates?: EmailTemplate[]; error?: string };
      if (!res.ok) throw new Error(payload.error || "Failed to load templates.");
      const list = payload.templates || [];
      setTemplates(list);
      const current = list.find((t) => t.kind === selected) || list[0] || null;
      if (current) {
        setSelected(current.kind);
        setDraft({ ...current });
        setExtraText(JSON.stringify(current.extra_json || {}, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!admin) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when admin is ready
  }, [admin]);

  const pick = (kind: string) => {
    const t = templates.find((x) => x.kind === kind);
    if (!t) return;
    setSelected(kind);
    setDraft({ ...t });
    setExtraText(JSON.stringify(t.extra_json || {}, null, 2));
    setSaved("");
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    setSaved("");
    let extra: Record<string, unknown> = {};
    try {
      extra = extraText.trim() ? (JSON.parse(extraText) as Record<string, unknown>) : {};
    } catch {
      setSaving(false);
      setError("Services JSON is invalid.");
      return;
    }
    try {
      const res = await adminFetch("/api/admin/email-templates", {
        method: "PATCH",
        body: JSON.stringify({
          kind: draft.kind,
          subject: draft.subject,
          body_text: draft.body_text,
          cta_label: draft.cta_label,
          cta_path: draft.cta_path,
          enabled: draft.enabled,
          extra_json: extra,
        }),
      });
      const payload = (await res.json()) as { template?: EmailTemplate; error?: string };
      if (!res.ok) throw new Error(payload.error || "Save failed.");
      if (payload.template) {
        setDraft(payload.template);
        setTemplates((prev) =>
          prev.map((t) => (t.kind === payload.template!.kind ? payload.template! : t))
        );
      }
      setSaved("Saved. Live sends use this copy immediately.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !admin) return <TableSkeleton />;
  if (loadingData) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1a1a1a] dark:text-white">Email templates</h1>
        <p className={cn(adminMuted, "mt-1")}>
          Wix replacement: edit D.1–D.4 copy here. Pause a type with the toggle. Placeholders:{" "}
          {"{{project_name}} {{project_id}} {{project_address}} {{trades_html}} {{services_html}}"}
        </p>
      </div>
      {error && (
        <div className="rounded-[10px] border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-[10px] border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {saved}
        </div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full shrink-0 space-y-1 lg:w-56">
          {templates.map((t) => (
            <button
              key={t.kind}
              type="button"
              onClick={() => pick(t.kind)}
              className={cn(
                "flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-sm",
                selected === t.kind
                  ? "bg-[#1f81df] text-white"
                  : "bg-white text-[#1a1a1a] hover:bg-[#f0f0f0] dark:bg-[#1a1a1a] dark:text-white"
              )}
            >
              <span>{t.label}</span>
              {!t.enabled && <span className="text-xs opacity-80">paused</span>}
            </button>
          ))}
        </div>
        {draft && (
          <div className="min-w-0 flex-1 space-y-3 rounded-[20px] border border-[#d4d4d4] bg-white p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-[#1a1a1a] dark:text-white">Send automatically</span>
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
              />
            </label>
            <label className="block text-sm">
              <span className={adminMuted}>Subject</span>
              <input
                className="mt-1 w-full rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className={adminMuted}>Body</span>
              <textarea
                className="mt-1 min-h-[220px] w-full rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 font-mono text-xs dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
                value={draft.body_text}
                onChange={(e) => setDraft({ ...draft, body_text: e.target.value })}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className={adminMuted}>Button label</span>
                <input
                  className="mt-1 w-full rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
                  value={draft.cta_label || ""}
                  onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className={adminMuted}>Button path</span>
                <input
                  className="mt-1 w-full rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
                  value={draft.cta_path || ""}
                  onChange={(e) => setDraft({ ...draft, cta_path: e.target.value })}
                />
              </label>
            </div>
            {draft.kind === "vendor_supplier" && (
              <label className="block text-sm">
                <span className={adminMuted}>Services JSON (name, detail, price, timing)</span>
                <textarea
                  className="mt-1 min-h-[160px] w-full rounded-[10px] border border-[#d4d4d4] bg-white px-3 py-2 font-mono text-xs dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
                  value={extraText}
                  onChange={(e) => setExtraText(e.target.value)}
                />
              </label>
            )}
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save template"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
