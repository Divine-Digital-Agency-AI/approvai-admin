"use client";

import { Download } from "lucide-react";
import { boardChip, boardIdleChip } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

export function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
          : cn("rounded-full px-3 py-1 text-xs font-medium", boardIdleChip)
      }
    >
      {label}
      <span className={active ? "ml-1 text-white/80" : "ml-1 text-[#999] dark:text-[#7f7f7f]"}>{count}</span>
    </button>
  );
}

export function ToolbarButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: typeof Download;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center gap-1.5 px-3 py-1.5", boardChip)}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
