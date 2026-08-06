/** Server-side FastAPI base URL for admin → API proxies. */
export function getBackendUrl(): string {
  const raw = (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://approvai-api.fly.dev"
  )
    .trim()
    .replace(/\/$/, "");
  return raw || "https://approvai-api.fly.dev";
}

/** Public client origin (end-user password reset landing). */
export function getClientPublicUrl(): string {
  return (
    process.env.CLIENT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_CLIENT_URL ||
    "https://www.approv-ai.com"
  )
    .trim()
    .replace(/\/$/, "");
}

/** Admin origin from request or env (admin password reset landing). */
export function getAdminPublicUrl(req: Request): string {
  const fromEnv = (process.env.ADMIN_PUBLIC_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");

  return "https://admin.approv-ai.com";
}
