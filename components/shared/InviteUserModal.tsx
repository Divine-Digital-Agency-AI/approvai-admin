"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import { supabase } from "@/lib/supabase";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function InviteUserModal({
  open,
  onClose,
  onUserCreated,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setRole("user");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .limit(1);

      if (existing && existing.length > 0) {
        setError("A user with this email already exists.");
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        email: email.trim().toLowerCase(),
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        role: role === "user" ? null : role,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      onUserCreated();
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) handleClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md animate-fade-in">
        <button
          onClick={handleClose}
          disabled={saving}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create User
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a new user profile to the system.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-400/20 border border-red-400/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-400/20 border border-green-400/50 rounded-lg text-green-500 text-sm">
              User created successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
                className="w-full px-4 py-2 bg-background border border-surface/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={saving}>
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
