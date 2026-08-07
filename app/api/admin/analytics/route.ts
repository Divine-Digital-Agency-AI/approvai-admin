import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

type TimePoint = { date: string; count: number };

function groupByDay(rows: { created_at: string }[], days: number): TimePoint[] {
  const now = new Date();
  const buckets: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets[d.toISOString().split("T")[0]] = 0;
  }

  for (const row of rows) {
    const key = new Date(row.created_at).toISOString().split("T")[0];
    if (key in buckets) buckets[key]++;
  }

  return Object.entries(buckets).map(([date, count]) => ({
    date: `${date.slice(5, 7)}/${date.slice(8, 10)}`,
    count,
  }));
}

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const url = new URL(req.url);
    const rawDays = Number(url.searchParams.get("days") || "30");
    const days = [7, 14, 30, 90].includes(rawDays) ? rawDays : 30;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const supabase = createServiceClient();
    const [signups, projects, extractions, aiCalls] = await Promise.all([
      supabase.from("profiles").select("created_at").gte("created_at", sinceStr),
      supabase.from("projects").select("created_at").gte("created_at", sinceStr),
      supabase.from("extractions").select("created_at").gte("created_at", sinceStr),
      supabase.from("ai_usage_log").select("created_at").gte("created_at", sinceStr),
    ]);

    if (signups.error) return jsonError(signups.error.message, 400);
    if (projects.error) return jsonError(projects.error.message, 400);
    if (extractions.error) return jsonError(extractions.error.message, 400);
    // ai_usage_log may be missing in older envs
    const aiRows =
      aiCalls.error?.code === "42P01" || aiCalls.error?.message?.includes("does not exist")
        ? []
        : aiCalls.error
          ? null
          : aiCalls.data || [];
    if (aiRows === null) return jsonError(aiCalls.error!.message, 400);

    return NextResponse.json({
      days,
      signups: groupByDay(signups.data || [], days),
      projects: groupByDay(projects.data || [], days),
      extractions: groupByDay(extractions.data || [], days),
      aiCalls: groupByDay(aiRows, days),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
