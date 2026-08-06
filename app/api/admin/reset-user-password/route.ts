import { NextResponse } from "next/server";
import {
  createServiceClient,
  normalizeEmail,
  requireAdminRoleFromBearerToken,
} from "@/app/api/admin/_lib/auth";
import {
  getAdminPublicUrl,
  getBackendUrl,
  getClientPublicUrl,
} from "@/lib/backend-url";

type Body = {
  email?: string;
  userId?: string;
};

/**
 * Admin-triggered password reset email via FastAPI + Resend.
 * Admin/super_admin targets land on admin /reset-password; others on the client app.
 */
export async function POST(req: Request) {
  try {
    await requireAdminRoleFromBearerToken(req.headers.get("authorization"));

    const body = (await req.json()) as Body;
    let email = normalizeEmail(body.email ?? "");
    const userId = (body.userId ?? "").trim();

    const supabase = createServiceClient();

    if (!email && userId) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !profile?.email) {
        return NextResponse.json(
          { error: "User email not found." },
          { status: 404 }
        );
      }
      email = normalizeEmail(profile.email);
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("email", email)
      .maybeSingle();

    const isAdminTarget =
      profile?.role === "admin" || profile?.role === "super_admin";
    const redirectTo = isAdminTarget
      ? `${getAdminPublicUrl(req)}/reset-password`
      : `${getClientPublicUrl()}/reset-password`;

    const res = await fetch(`${getBackendUrl()}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirect_to: redirectTo }),
    });

    if (!res.ok) {
      let detail = "Failed to send password reset email.";
      try {
        const data = (await res.json()) as { detail?: string };
        if (typeof data.detail === "string" && data.detail.trim()) {
          detail = data.detail;
        }
      } catch {
        // keep default
      }
      return NextResponse.json({ error: detail }, { status: res.status });
    }

    return NextResponse.json({
      ok: true,
      message: `Password reset email sent to ${email}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized." ||
      message === "Forbidden." ||
      message === "Missing or invalid Authorization header." ||
      message === "Missing access token." ||
      message === "Admin profile not found."
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
