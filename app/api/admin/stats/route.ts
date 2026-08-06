import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();

    const [
      users,
      projects,
      blueprints,
      municipalities,
      extractionsCount,
      earlyAccess,
      aiUsage,
      failedBps,
      processedBps,
      recentExtractions,
      recentProjects,
      recentUsers,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("blueprints").select("id", { count: "exact", head: true }),
      supabase.from("municipalities").select("id", { count: "exact", head: true }),
      supabase.from("extractions").select("id", { count: "exact", head: true }),
      supabase.from("early_access_emails").select("id", { count: "exact", head: true }),
      supabase.from("ai_usage_log").select("id", { count: "exact", head: true }),
      supabase
        .from("blueprints")
        .select("id", { count: "exact", head: true })
        .eq("status", "error"),
      supabase
        .from("blueprints")
        .select("id", { count: "exact", head: true })
        .eq("status", "processed"),
      supabase
        .from("extractions")
        .select("id, ai_model_used, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("projects")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("profiles")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const failedExtractions = failedBps.count ?? 0;
    const successfulExtractions = processedBps.count ?? 0;
    const successRate =
      successfulExtractions + failedExtractions > 0
        ? (successfulExtractions / (successfulExtractions + failedExtractions)) * 100
        : 100;

    const recent: {
      id: string;
      kind: string;
      label: string;
      at: string;
      meta: string | number | null;
    }[] = [];

    for (const e of recentExtractions.data || []) {
      recent.push({
        id: e.id,
        kind: "extraction",
        label: "Extraction completed",
        at: e.created_at,
        meta: e.ai_model_used,
      });
    }
    for (const p of recentProjects.data || []) {
      recent.push({
        id: p.id,
        kind: "project",
        label: "Project created",
        at: p.created_at,
        meta: p.name,
      });
    }
    for (const u of recentUsers.data || []) {
      recent.push({
        id: u.id,
        kind: "user",
        label: "New user signup",
        at: u.created_at,
        meta: u.email,
      });
    }
    recent.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return NextResponse.json({
      stats: {
        totalUsers: users.count ?? 0,
        totalProjects: projects.count ?? 0,
        totalMunicipalities: municipalities.count ?? 0,
        totalBlueprints: blueprints.count ?? 0,
        aiApiCalls: aiUsage.count ?? 0,
        failedExtractions,
        aiExtractions: extractionsCount.count ?? 0,
        earlyAccessRequests: earlyAccess.count ?? 0,
        extractionSuccessRate: Math.round(successRate * 10) / 10,
        successfulExtractions,
      },
      recentActivity: recent.slice(0, 12),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
