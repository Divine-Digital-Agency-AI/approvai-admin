"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme-context";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { authOverlayShell, themedFieldClass } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

export default function AdminResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const checkSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasRecoveryToken =
        urlParams.has("token") ||
        hashParams.has("access_token") ||
        hashParams.has("type");

      if (!hasRecoveryToken) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          if (!cancelled) setIsValidSession(false);
          return;
        }
      }

      // Keep callback sync — awaiting inside onAuthStateChange holds the auth lock.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
        } else if (session && hasRecoveryToken) {
          setIsValidSession(true);
        }
      });
      unsubscribe = () => subscription.unsubscribe();

      timeoutId = setTimeout(() => {
        if (cancelled) return;
        void supabase.auth.getSession().then(({ data: { session } }) => {
          if (cancelled) return;
          if (session && hasRecoveryToken) {
            setIsValidSession(true);
          } else {
            setIsValidSession((prev) => (prev === null ? false : prev));
          }
        });
      }, 2000);
    };

    void checkSession();
    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5] p-4 dark:bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-[#666666] dark:text-[#999999]">
            Verifying reset link…
          </p>
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5] p-4 dark:bg-black">
        <div className={cn(authOverlayShell, "text-center")}>
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a] dark:text-white">
            Invalid or expired link
          </h1>
          <p className="mb-6 text-sm text-[#666666] dark:text-[#999999]">
            Request a new password reset from the admin login page.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5e5e5] p-4 dark:bg-black">
        <div className={cn(authOverlayShell, "text-center")}>
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a] dark:text-white">
            Password updated
          </h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">
            Redirecting to admin login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#e5e5e5] p-4 dark:bg-black">
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-[10px]",
          "border border-[#d4d4d4] bg-white/80 text-[#666666] backdrop-blur-sm",
          "hover:bg-[#f0f0f0] dark:border-[#333333] dark:bg-[#1a1a1a]/80 dark:text-[#7f7f7f]"
        )}
        aria-label="Toggle theme"
      >
        <Sun
          className={cn(
            "h-3.5 w-3.5 transition-all",
            theme === "dark" ? "rotate-0 scale-100" : "absolute rotate-90 scale-0"
          )}
        />
        <Moon
          className={cn(
            "h-3.5 w-3.5 transition-all",
            theme === "light" ? "rotate-0 scale-100" : "absolute rotate-90 scale-0"
          )}
        />
      </button>

      <div className={cn(authOverlayShell, "animate-fade-in")}>
        <div className="mb-6 text-center">
          <img
            src="/ant.png"
            alt=""
            width={72}
            height={40}
            className="mx-auto mb-3 h-10 w-auto object-contain"
          />
          <h1 className="text-2xl font-semibold text-[#1a1a1a] dark:text-white">
            New password
          </h1>
          <p className="mt-1 text-sm text-[#666666] dark:text-[#999999]">
            Choose a password for your admin account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-sm text-red-500">
              {error}
            </div>
          )}
          <Input
            type="password"
            label="New password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={cn("bg-white dark:bg-[#0d0d0d]", themedFieldClass)}
          />
          <Input
            type="password"
            label="Confirm password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            required
            autoComplete="new-password"
            className={cn("bg-white dark:bg-[#0d0d0d]", themedFieldClass)}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            disabled={!password || !confirmPassword}
          >
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
