import { NextResponse } from "next/server";
import {
  createServiceClient,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

type MunicipalityBody = {
  id?: string;
  name?: string;
  slug?: string;
  county?: string;
  state?: string;
  website_url?: string | null;
  permit_form_template?: string | null;
  approved?: boolean;
  is_active?: boolean;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("municipalities")
      .select(
        "id, name, slug, county, state, is_active, approved, website_url, permit_form_template"
      )
      .order("name", { ascending: true });

    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ municipalities: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as MunicipalityBody;
    const name = (body.name ?? "").trim();
    const county = (body.county ?? "").trim();
    const state = (body.state ?? "").trim();
    if (!name || !county || !state) {
      return jsonError("Name, County, and State are required.", 400);
    }

    const slug = ((body.slug ?? "").trim() || slugify(name));
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("municipalities")
      .insert({
        name,
        slug,
        county,
        state,
        website_url: body.website_url || null,
        permit_form_template: body.permit_form_template || null,
      })
      .select(
        "id, name, slug, county, state, is_active, approved, website_url, permit_form_template"
      )
      .single();

    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ municipality: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as MunicipalityBody;
    const id = (body.id ?? "").trim();
    if (!id) return jsonError("id is required.", 400);

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.slug !== undefined) updates.slug = body.slug.trim() || slugify(String(body.name || ""));
    if (body.county !== undefined) updates.county = body.county.trim();
    if (body.state !== undefined) updates.state = body.state.trim();
    if (body.website_url !== undefined) updates.website_url = body.website_url || null;
    if (body.permit_form_template !== undefined) {
      updates.permit_form_template = body.permit_form_template || null;
    }
    if (typeof body.approved === "boolean") updates.approved = body.approved;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    if (Object.keys(updates).length === 0) {
      return jsonError("No fields to update.", 400);
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("municipalities")
      .update(updates)
      .eq("id", id)
      .select(
        "id, name, slug, county, state, is_active, approved, website_url, permit_form_template"
      )
      .single();

    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ municipality: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));
    const body = (await req.json()) as { id?: string };
    const id = (body.id ?? "").trim();
    if (!id) return jsonError("id is required.", 400);

    const supabase = createServiceClient();
    const { error } = await supabase.from("municipalities").delete().eq("id", id);
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
