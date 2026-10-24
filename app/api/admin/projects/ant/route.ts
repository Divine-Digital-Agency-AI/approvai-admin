import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

const MAX_MESSAGES = 60;
const MAX_CHARS = 2000;

/** What Ant and the person said on one job, newest 60, read only (24 Oct 2026: admins could not see it at all). */
export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const projectId = (new URL(req.url).searchParams.get("projectId") ?? "").trim();
    if (!projectId) return jsonError("projectId is required.", 400);

    const supabase = createServiceClient();
    const { data: threads, error: threadError } = await supabase
      .from("ant_threads")
      .select("id")
      .eq("project_id", projectId);
    if (threadError) return jsonError(threadError.message, 400);
    const ids = (threads || []).map((t) => t.id).filter(Boolean);
    if (!ids.length) return NextResponse.json({ messages: [] });

    const { data, error } = await supabase
      .from("ant_messages")
      .select("role, content, created_at")
      .in("thread_id", ids)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(MAX_MESSAGES);
    if (error) return jsonError(error.message, 400);

    const messages = (data || [])
      .filter((m) => typeof m.content === "string" && m.content.trim())
      .map((m) => ({ role: m.role, created_at: m.created_at, content: String(m.content).slice(0, MAX_CHARS) }))
      .reverse();
    return NextResponse.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
