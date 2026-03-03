"use client";

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
