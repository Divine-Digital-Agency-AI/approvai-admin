import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

type PatchBody = { blueprintId?: string; action?: "reset" };
type DeleteBody = { blueprintId?: string };

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();
    const url = new URL(req.url);
    const blueprintId = url.searchParams.get("blueprintId")?.trim();

    if (blueprintId) {
      const { data: extractionData, error } = await supabase
        .from("extractions")
        .select("*")
        .eq("blueprint_id", blueprintId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) return jsonError(error.message, 400);

      if (!extractionData?.length) {
        return NextResponse.json({ extraction: null });
      }

      const ext = extractionData[0];
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("extracted_fields")
        .select("field_category, field_name, field_value, confidence")
        .eq("extraction_id", ext.id);

      if (fieldsError) return jsonError(fieldsError.message, 400);

      return NextResponse.json({
        extraction: { ...ext, fields: fieldsData || [] },
      });
    }

    const { data, error } = await supabase
      .from("blueprints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ blueprints: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as PatchBody;
    const blueprintId = (body.blueprintId ?? "").trim();
    if (!blueprintId) return jsonError("blueprintId is required.", 400);
    if (body.action !== "reset") return jsonError("Unsupported action.", 400);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("blueprints")
      .update({ status: "uploaded", processing_error: null })
      .eq("id", blueprintId);

    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as DeleteBody;
    const blueprintId = (body.blueprintId ?? "").trim();
    if (!blueprintId) return jsonError("blueprintId is required.", 400);

    const supabase = createServiceClient();
    const { data: extractions, error: extListError } = await supabase
      .from("extractions")
      .select("id")
      .eq("blueprint_id", blueprintId);
    if (extListError) return jsonError(extListError.message, 400);

    const extractionIds = (extractions || []).map((e) => e.id);
    if (extractionIds.length > 0) {
      const { error: fieldsError } = await supabase
        .from("extracted_fields")
        .delete()
        .in("extraction_id", extractionIds);
      if (fieldsError) return jsonError(fieldsError.message, 400);
    }

    const { error: extError } = await supabase
      .from("extractions")
      .delete()
      .eq("blueprint_id", blueprintId);
    if (extError) return jsonError(extError.message, 400);

    const { error } = await supabase.from("blueprints").delete().eq("id", blueprintId);
    if (error) return jsonError(error.message, 400);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
