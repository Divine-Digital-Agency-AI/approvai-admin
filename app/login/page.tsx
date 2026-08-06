"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import ForgotPasswordModal from "@/components/shared/ForgotPasswordModal";
import { Sun, Moon, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { authOverlayShell, themedFieldClass } from "@/lib/themed-surfaces";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { signIn, admin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && admin) {
      router.push("/");
    }
  }, [admin, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-[100dvh] min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#e5e5e5] p-4 dark:bg-black sm:p-6 md:p-8">
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-[10px]",
          "border border-[#d4d4d4] bg-white/80 text-[#666666] backdrop-blur-sm",
          "hover:bg-[#f0f0f0] dark:border-[#333333] dark:bg-[#1a1a1a]/80 dark:text-[#7f7f7f] dark:hover:bg-[#262626]"
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
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/ant.png"
            alt=""
            width={72}
            height={40}
            className="mb-4 h-10 w-auto object-contain"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
            ApprovAI
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#1f81df]" />
            <p className="text-sm font-medium tracking-wide text-[#1f81df]">Admin Panel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-[10px] border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-sm text-red-500">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={cn("bg-white dark:bg-[#1a1a1a]", themedFieldClass)}
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={cn("bg-white dark:bg-[#1a1a1a]", themedFieldClass)}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            className="group/btn w-full gap-2"
            disabled={!email || !password}
          >
            Sign In
            <ArrowRight className="h-4 w-4 translate-x-0 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </form>
      </div>

      <ForgotPasswordModal
        open={showForgot}
        onClose={() => setShowForgot(false)}
        initialEmail={email}
      />
    </div>
  );
}
