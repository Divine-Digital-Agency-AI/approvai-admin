import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));

    const url = new URL(req.url);
    const kind = (url.searchParams.get("kind") || "").trim();
    const q = (url.searchParams.get("q") || "").trim();
    const limitRaw = Number(url.searchParams.get("limit") || DEFAULT_LIMIT);
    const offsetRaw = Number(url.searchParams.get("offset") || 0);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(1, Math.floor(limitRaw)), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;

    const supabase = createServiceClient();
    let query = supabase
      .from("email_log")
      .select(
        "id, user_id, to_email, from_email, reply_to, kind, subject, project_id, blueprint_id, resend_message_id, error, sent_at",
        { count: "exact" }
      )
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (kind && kind !== "all") {
      query = query.eq("kind", kind);
    }
    if (q) {
      // PostgREST or() — escape commas in user input by stripping them
      const safe = q.replace(/[,()]/g, " ").trim();
      if (safe) {
        query = query.or(
          `to_email.ilike.%${safe}%,subject.ilike.%${safe}%,from_email.ilike.%${safe}%`
        );
      }
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      emails: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized." ||
      message === "Forbidden." ||
      message === "Missing or invalid Authorization header." ||
      message === "Missing access token."
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
