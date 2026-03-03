"use client";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
