import { NextResponse } from "next/server";
import { getAdminPublicUrl, getBackendUrl } from "@/lib/backend-url";

type Body = {
  email?: string;
};

/**
 * Public proxy: admin login "Forgot password?" → FastAPI Resend recovery mail.
 * Landing page is always this admin app's /reset-password.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const redirectTo = `${getAdminPublicUrl(req)}/reset-password`;
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
      message:
        "If an account exists for that email, we sent a password reset link.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
