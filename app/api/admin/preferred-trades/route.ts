import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

const SELECT =
  "id,trade,company,contact,email,phone,sort_order,is_active,updated_at";

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("preferred_trades")
      .select(SELECT)
      .order("sort_order");
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ trades: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as { trade?: string };
    const trade = (body.trade ?? "").trim();
    if (!trade) return jsonError("Trade name is required.", 400);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("preferred_trades")
      .insert({ trade, sort_order: 100 })
      .select(SELECT)
      .single();
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ trade: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as {
      id?: string;
      trade?: string;
      company?: string;
      contact?: string;
      email?: string;
      phone?: string;
      sort_order?: number;
      is_active?: boolean;
    };
    const id = (body.id ?? "").trim();
    if (!id) return jsonError("id is required.", 400);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ["trade", "company", "contact", "email", "phone"] as const) {
      if (typeof body[key] === "string") patch[key] = body[key];
    }
    if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;
    if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("preferred_trades")
      .update(patch)
      .eq("id", id)
      .select(SELECT)
      .single();
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ trade: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const url = new URL(req.url);
    const id = (url.searchParams.get("id") || "").trim();
    if (!id) return jsonError("id is required.", 400);
    const supabase = createServiceClient();
    const { error } = await supabase.from("preferred_trades").delete().eq("id", id);
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
