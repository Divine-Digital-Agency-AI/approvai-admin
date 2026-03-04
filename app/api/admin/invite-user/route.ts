import { NextResponse } from "next/server";
import {
  createServiceClient,
  normalizeEmail,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";

type InviteBody = {
  email?: string;
};

export async function POST(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));

    const body = (await req.json()) as InviteBody;
    const email = normalizeEmail(body.email ?? "");
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    const { error: listError } = await supabase
      .from("early_access_emails")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized." || message === "Forbidden." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
