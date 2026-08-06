import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

type PatchBody = {
  profileId?: string;
  role?: string | null;
};

type DeleteBody = {
  profileId?: string;
  userId?: string;
};

/** List all profiles + project counts (service role; bypasses own-profile RLS). */
export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, user_id, email, first_name, last_name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("user_id");

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 400 });
    }

    const countMap: Record<string, number> = {};
    for (const p of projects || []) {
      if (!p.user_id) continue;
      countMap[p.user_id] = (countMap[p.user_id] || 0) + 1;
    }

    const users = (profiles || []).map((u) => ({
      ...u,
      projectCount: countMap[u.user_id] || 0,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: authErrorStatus(message) });
  }
}

/** Update a user's role (super_admin only). */
export async function PATCH(req: Request) {
  try {
    const admin = await requireAdminRoleFromBearerToken(
      req.headers.get("authorization")
    );
    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await req.json()) as PatchBody;
    const profileId = (body.profileId ?? "").trim();
    if (!profileId) {
      return NextResponse.json({ error: "profileId is required." }, { status: 400 });
    }

    let role: string | null = body.role ?? null;
    if (role === "user" || role === "") role = null;
    if (role !== null && role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: authErrorStatus(message) });
  }
}

/** Delete profile, projects, and auth user (super_admin only). */
export async function DELETE(req: Request) {
  try {
    const admin = await requireAdminRoleFromBearerToken(
      req.headers.get("authorization")
    );
    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await req.json()) as DeleteBody;
    const profileId = (body.profileId ?? "").trim();
    const userId = (body.userId ?? "").trim();
    if (!profileId || !userId) {
      return jsonError("profileId and userId are required.", 400);
    }
    if (userId === admin.userId) {
      return jsonError("You cannot delete your own account.", 400);
    }

    const supabase = createServiceClient();
    const { data: profile, error: loadError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .maybeSingle();

    if (loadError) return jsonError(loadError.message, 400);
    if (!profile) return jsonError("Profile not found.", 404);
    if (profile.user_id !== userId) {
      return jsonError("profileId does not match userId.", 400);
    }

    const { error: projectsError } = await supabase
      .from("projects")
      .delete()
      .eq("user_id", userId);
    if (projectsError) return jsonError(projectsError.message, 400);

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);
    if (profileError) return jsonError(profileError.message, 400);

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return jsonError(authError.message, 400);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
