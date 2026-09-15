"use client";

import { Download } from "lucide-react";

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
          : "rounded-full bg-[#f7f7f7] px-3 py-1 text-xs font-medium text-[#666]"
      }
    >
      {label}
      <span className={active ? "ml-1 text-white/80" : "ml-1 text-[#999]"}>{count}</span>
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
      className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e4] bg-white px-3 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f7f7f7]"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
