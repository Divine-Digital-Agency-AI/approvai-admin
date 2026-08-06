import { NextResponse } from "next/server";
import {
  createServiceClient,
  normalizeEmail,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import { authErrorStatus, jsonError } from "@/app/api/admin/_lib/http";

type CreateUserBody = {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string | null;
};

export async function POST(req: Request) {
  try {
    const admin = await requireAdminRoleFromBearerToken(
      req.headers.get("authorization")
    );

    const body = (await req.json()) as CreateUserBody;
    const email = normalizeEmail(body.email ?? "");
    const password = body.password?.trim() ?? "";
    const firstName = (body.first_name ?? "").trim() || null;
    const lastName = (body.last_name ?? "").trim() || null;

    let role: string | null = body.role ?? null;
    if (role === "user" || role === "") role = null;
    if (role !== null && role !== "admin" && role !== "super_admin") {
      return jsonError("Invalid role.", 400);
    }
    if (role !== null && admin.role !== "super_admin") {
      return jsonError("Only super admins can assign admin roles.", 403);
    }

    if (!email) {
      return jsonError("Email is required.", 400);
    }
    if (!password || password.length < 8) {
      return jsonError("Password must be at least 8 characters.", 400);
    }

    const supabase = createServiceClient();

    const { data: createdUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !createdUser.user) {
      return jsonError(createError?.message || "Failed to create user.", 400);
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: createdUser.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      return jsonError(profileError.message, 400);
    }

    const { error: listError } = await supabase
      .from("early_access_emails")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    if (listError) {
      return jsonError(listError.message, 400);
    }

    return NextResponse.json({ ok: true, userId: createdUser.user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, authErrorStatus(message));
  }
}
