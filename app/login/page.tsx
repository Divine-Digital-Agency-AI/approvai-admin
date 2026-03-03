"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { Sun, Moon, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-900 relative overflow-hidden">
      <button
        onClick={toggleTheme}
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded border border-gray-200 dark:border-gray-700",
          "flex items-center justify-center",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
          "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400",
          "z-10"
        )}
        aria-label="Toggle theme"
      >
        <Sun className={cn("h-3 w-3 text-gray-900 dark:text-gray-100 transition-all", theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute")} />
        <Moon className={cn("h-3 w-3 text-gray-900 dark:text-gray-100 transition-all", theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute")} />
      </button>

      <div className="w-full max-w-md mx-auto relative z-10 flex flex-col items-center gap-8">
        <div className="text-center flex flex-col items-center animate-fade-in">
          <h1
            className="font-[var(--font-inter-thin)] text-primary-dark dark:text-gray-100 uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[clamp(28px,6vw,48px)]"
            style={{ fontWeight: 100 }}
          >
            ApprovAI
          </h1>
          <div className="h-px bg-primary-dark dark:bg-gray-100 mt-2 w-full max-w-[180px] sm:max-w-[240px] mx-auto" />
          <div className="flex items-center gap-2 mt-3">
            <Shield className="w-4 h-4 text-primary" />
            <p className="font-medium text-primary tracking-wide text-sm">Admin Panel</p>
          </div>
        </div>

        <div
          className="group w-full rounded-lg p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
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
              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-primary/40 focus:border-primary/40"
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-primary/40 focus:border-primary/40"
            />

            <Button
              type="submit"
              isLoading={isLoading}
              variant="outline"
              className="group/btn w-full bg-transparent gap-2 shadow-[0_0_24px_rgba(30,64,175,0.2)] dark:shadow-[0_0_24px_rgba(59,130,246,0.15)] hover:shadow-[0_0_32px_rgba(30,64,175,0.4)] dark:hover:shadow-[0_0_32px_rgba(59,130,246,0.3)] hover:scale-105 transition-all duration-300"
              disabled={!email || !password}
            >
              Sign In
              <ArrowRight className="w-4 h-4 translate-x-1 transition-transform duration-300 group-hover/btn:translate-x-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
