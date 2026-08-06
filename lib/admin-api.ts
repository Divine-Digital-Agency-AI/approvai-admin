import { supabase } from "@/lib/supabase";

export async function getAdminAccessToken(): Promise<string> {
  // Validate/refresh with the auth server first so we don't send a stale JWT.
  const { error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error("Not signed in.");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Not signed in.");
  }
  return data.session.access_token;
}

export async function adminFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getAdminAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(path, { ...init, headers });
}
