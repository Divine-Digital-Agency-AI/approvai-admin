import { NextResponse } from "next/server";
import {
  createServiceClient,
  normalizeEmail,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";

type CreateUserBody = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));

    const body = (await req.json()) as CreateUserBody;
    const email = normalizeEmail(body.email ?? "");
    const password = body.password?.trim() ?? "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: createdUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !createdUser.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create user." },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: createdUser.user.id,
        email,
        role: null,
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: listError } = await supabase
      .from("early_access_emails")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: createdUser.user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized." || message === "Forbidden." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
