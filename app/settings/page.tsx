"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Settings, Shield } from "lucide-react";

export default function SettingsPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) router.push("/login");
  }, [admin, loading, router]);

  if (loading || !admin) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Admin Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-gray-500 dark:text-gray-400">Role:</span>
              <span className="font-medium text-gray-900 dark:text-white">{admin.role}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Email:</span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">{admin.authUser.email}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">User ID:</span>{" "}
              <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{admin.authUser.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Feature flags, extraction limits, and other system configuration will be added here.
          </p>
        </div>
      </div>
    </div>
  );
}
