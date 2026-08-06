import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();

    const { data: deletedLogs, error: logError } = await supabase
      .from("ai_usage_log")
      .delete()
      .or("status.eq.error,error_message.not.is.null")
      .select("id");

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 400 });
    }

    const { data: resetBlueprints, error: bpError } = await supabase
      .from("blueprints")
      .update({ status: "uploaded", processing_error: null })
      .or("status.eq.error,processing_error.not.is.null")
      .select("id");

    if (bpError) {
      return NextResponse.json({ error: bpError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      aiUsageErrorsDeleted: deletedLogs?.length ?? 0,
      blueprintsCleared: resetBlueprints?.length ?? 0,
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
