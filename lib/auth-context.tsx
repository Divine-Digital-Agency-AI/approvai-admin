"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AdminRole = "admin" | "super_admin";

interface AdminUser {
  authUser: User;
  role: AdminRole;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchAdminRole(userId: string): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  const role = data.role as string;
  if (role === "admin" || role === "super_admin") return role as AdminRole;
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveAdmin = useCallback(async (authUser: User | null) => {
    try {
      if (!authUser) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      const role = await fetchAdminRole(authUser.id);
      if (!role) {
        await supabase.auth.signOut();
        setAdmin(null);
        setLoading(false);
        return;
      }

      setAdmin({ authUser, role });
      setLoading(false);
    } catch (error) {
      console.error("[AuthProvider] Failed to resolve admin user:", error);
      setAdmin(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message?.includes("Refresh Token") || error.message?.includes("refresh_token")) {
            await supabase.auth.signOut();
          }

          if (isMounted) {
            setAdmin(null);
            setLoading(false);
          }
          return;
        }

        if (!isMounted) return;
        await resolveAdmin(session?.user ?? null);
      } catch (error) {
        console.error("[AuthProvider] Session bootstrap failed:", error);
        if (isMounted) {
          setAdmin(null);
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "TOKEN_REFRESHED" && !session) {
          if (isMounted) {
            setAdmin(null);
            setLoading(false);
          }
          return;
        }
        if (event === "SIGNED_OUT") {
          if (isMounted) {
            setAdmin(null);
            setLoading(false);
          }
          return;
        }
        if (!isMounted) return;
        await resolveAdmin(session?.user ?? null);
      } catch (error) {
        console.error("[AuthProvider] Auth state change failed:", error);
        if (isMounted) {
          setAdmin(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resolveAdmin]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Sign in failed: No user data returned");
    }

    const role = await fetchAdminRole(data.user.id);
    if (!role) {
      await supabase.auth.signOut();
      throw new Error("Access denied. Admin privileges required.");
    }

    setAdmin({ authUser: data.user, role });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
