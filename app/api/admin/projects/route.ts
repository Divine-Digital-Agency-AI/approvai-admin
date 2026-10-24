import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";
import { jobStage } from "@/lib/job-stage";

type PatchBody = { projectId?: string; status?: string };
type DeleteBody = { projectId?: string };

const ALLOWED_STATUSES = new Set(["created", "processing", "ready", "completed"]);

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return jsonError(error.message, 400);

    const userIds = [...new Set((projects || []).map((p) => p.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await supabase
          .from("profiles")
          .select("user_id, email, first_name, last_name")
          .in("user_id", userIds)
      : { data: [] as { user_id: string; email: string | null; first_name: string | null; last_name: string | null }[] };

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const { data: blueprints } = await supabase.from("blueprints").select("project_id, status, updated_at");
    const bpMap: Record<string, number> = {};
    const bpLatest: Record<string, { status: string; updated_at: string | null }> = {};
    for (const bp of blueprints || []) {
      if (!bp.project_id) continue;
      bpMap[bp.project_id] = (bpMap[bp.project_id] || 0) + 1;
      const seen = bpLatest[bp.project_id];
      if (!seen || String(bp.updated_at || "") > String(seen.updated_at || "")) {
        bpLatest[bp.project_id] = { status: bp.status, updated_at: bp.updated_at };
      }
    }

    // Where each job stands with Ant (24 Oct 2026): its newest chat message, and whether Ant prepared an application.
    const { data: threads } = await supabase.from("ant_threads").select("id, project_id").not("project_id", "is", null);
    const threadProject = new Map((threads || []).map((t) => [t.id as string, t.project_id as string]));
    const threadIds = [...threadProject.keys()];
    const lastActivity: Record<string, string> = {};
    const prepared = new Set<string>();
    if (threadIds.length) {
      const { data: recent } = await supabase
        .from("ant_messages")
        .select("thread_id, created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: false })
        .limit(5000);
      for (const m of recent || []) {
        const project = threadProject.get(m.thread_id as string);
        if (project && !lastActivity[project]) lastActivity[project] = m.created_at as string;
      }
      const { data: applications } = await supabase
        .from("ant_messages")
        .select("thread_id")
        .in("thread_id", threadIds)
        .not("metadata->application", "is", null)
        .limit(2000);
      for (const m of applications || []) {
        const project = threadProject.get(m.thread_id as string);
        if (project) prepared.add(project);
      }
    }

    const rows = (projects || []).map((p) => {
      const profile = profileMap.get(p.user_id);
      return {
        ...p,
        blueprintCount: bpMap[p.id] || 0,
        lastActivity: lastActivity[p.id] || null,
        stage: jobStage({
          intake: p.intake_data,
          blueprint: bpLatest[p.id] || null,
          lastActivity: lastActivity[p.id] || null,
          applicationPrepared: prepared.has(p.id),
        }),
        profiles: profile
          ? {
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
            }
          : null,
      };
    });

    return NextResponse.json({ projects: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as PatchBody;
    const projectId = (body.projectId ?? "").trim();
    const status = (body.status ?? "").trim();
    if (!projectId || !status) {
      return jsonError("projectId and status are required.", 400);
    }
    if (!ALLOWED_STATUSES.has(status)) {
      return jsonError("Invalid status.", 400);
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", projectId);

    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as DeleteBody;
    const projectId = (body.projectId ?? "").trim();
    if (!projectId) return jsonError("projectId is required.", 400);

    const supabase = createServiceClient();
    const { error: bpError } = await supabase
      .from("blueprints")
      .delete()
      .eq("project_id", projectId);
    if (bpError) return jsonError(bpError.message, 400);

    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) return jsonError(error.message, 400);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
