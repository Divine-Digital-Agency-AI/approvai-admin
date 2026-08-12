import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

const SELECT =
  "kind,label,subject,body_text,cta_label,cta_path,enabled,extra_json,updated_at";

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select(SELECT)
      .order("kind");
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ templates: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as {
      kind?: string;
      subject?: string;
      body_text?: string;
      cta_label?: string | null;
      cta_path?: string | null;
      enabled?: boolean;
      extra_json?: Record<string, unknown>;
    };
    const kind = (body.kind ?? "").trim();
    if (!kind) return jsonError("kind is required.", 400);

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.subject === "string") patch.subject = body.subject;
    if (typeof body.body_text === "string") patch.body_text = body.body_text;
    if (body.cta_label !== undefined) patch.cta_label = body.cta_label;
    if (body.cta_path !== undefined) patch.cta_path = body.cta_path;
    if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
    if (body.extra_json && typeof body.extra_json === "object") {
      patch.extra_json = body.extra_json;
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("email_templates")
      .update(patch)
      .eq("kind", kind)
      .select(SELECT)
      .single();
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ template: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
