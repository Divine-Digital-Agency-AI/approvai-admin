import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

if (process.env.NODE_ENV === 'development' && supabaseUrl) {
  console.log('[Supabase Admin] URL:', supabaseUrl);
}

const _supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
    })
  : null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    validateSupabaseConfig();
    if (!_supabase) {
      throw new Error('Supabase client not initialized');
    }
    return (_supabase as unknown as Record<string, unknown>)[prop as string];
  }
});
