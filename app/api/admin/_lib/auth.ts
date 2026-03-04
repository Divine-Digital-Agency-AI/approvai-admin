import { createClient } from "@supabase/supabase-js";

type AdminRole = "admin" | "super_admin";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createServiceClient() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) for admin API routes."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireAdminRoleFromBearerToken(
  authorizationHeader: string | null
): Promise<{ userId: string; role: AdminRole }> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header.");
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    throw new Error("Missing access token.");
  }

  const supabase = createServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error("Unauthorized.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Admin profile not found.");
  }

  if (profile.role !== "admin" && profile.role !== "super_admin") {
    throw new Error("Forbidden.");
  }

  return { userId: userData.user.id, role: profile.role as AdminRole };
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
