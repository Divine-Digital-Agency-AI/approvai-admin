"use client";

import { useEffect, useState } from "react";
import { KeyRound, X } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import { themedFieldClass } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordModal({
  open,
  onClose,
  initialEmail = "",
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setError("");
      setSuccess(false);
    }
  }, [open, initialEmail]);

  if (!open) return null;

  const handleClose = () => {
    if (isLoading) return;
    setEmail(initialEmail);
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        let detail = "Failed to send password reset email.";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) detail = body.error;
        } catch {
          // keep default
        }
        throw new Error(detail);
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) handleClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-fade-in rounded-[20px] border border-[#e5e5e5] bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#1a1a1a]">
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-lg p-1 text-[#999999] hover:bg-[#f0f0f0] hover:text-[#666666] disabled:opacity-50 dark:hover:bg-[#262626]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">
              Reset password
            </h3>
            <p className="text-sm text-[#666666] dark:text-[#999999]">
              We&apos;ll email a link to choose a new password.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-[10px] border border-red-400/40 bg-red-400/10 px-3 py-2.5 text-sm text-red-500">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="rounded-[10px] border border-green-400/40 bg-green-400/10 px-3 py-2.5 text-sm text-green-600 dark:text-green-400">
              If an account exists for that email, we sent a password reset link.
              Check your inbox (and spam).
            </div>
            <Button type="button" className="w-full" onClick={handleClose}>
              Back to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              className={cn("bg-white dark:bg-[#0d0d0d]", themedFieldClass)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isLoading}>
                Send reset link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
