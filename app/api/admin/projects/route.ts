import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

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

    const { data: blueprints } = await supabase.from("blueprints").select("project_id");
    const bpMap: Record<string, number> = {};
    for (const bp of blueprints || []) {
      if (!bp.project_id) continue;
      bpMap[bp.project_id] = (bpMap[bp.project_id] || 0) + 1;
    }

    const rows = (projects || []).map((p) => {
      const profile = profileMap.get(p.user_id);
      return {
        ...p,
        blueprintCount: bpMap[p.id] || 0,
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
