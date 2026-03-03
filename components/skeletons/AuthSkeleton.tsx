"use client";

export function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-px w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="rounded-lg p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
            <div className="space-y-3">
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
