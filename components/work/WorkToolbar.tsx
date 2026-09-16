"use client";

import { Download, Printer, RotateCcw, Upload } from "lucide-react";
import { useRef } from "react";
import { FilterChip, ToolbarButton } from "./WorkToolbarBits";
import { WorkNav } from "./WorkNav";
import { formatSavedAt } from "@/lib/logic/format";
import { boardChip, boardDivider, boardFaint, boardTitle, boardToolbar } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";
import type { WorkKind, WorkOwner, WorkStatus } from "@/lib/work/types";

export type WorkView = "now" | "all" | "proof";

const VIEWS: { id: WorkView; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "all", label: "All work" },
  { id: "proof", label: "Proven" },
];

interface WorkToolbarProps {
  view: WorkView;
  present: boolean;
  savedAt: string;
  now: number;
  progress: string;
  filter: WorkStatus | "all";
  ownerFilter: WorkOwner | "all";
  kindFilter: WorkKind | "all";
  statusCounts: Record<WorkStatus | "all", number>;
  ownerCounts: Record<WorkOwner | "all", number>;
  kindCounts: Record<WorkKind | "all", number>;
  viewCounts: { now: number; all: number; proof: number };
  groupCounts: Record<string, { done: number; total: number }>;
  onViewChange: (view: WorkView) => void;
  onFilterChange: (filter: WorkStatus | "all") => void;
  onOwnerFilterChange: (filter: WorkOwner | "all") => void;
  onKindFilterChange: (filter: WorkKind | "all") => void;
  onPresentChange: (present: boolean) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function WorkToolbar({
  view,
  present,
  savedAt,
  now,
  progress,
  filter,
  ownerFilter,
  kindFilter,
  statusCounts,
  ownerCounts,
  kindCounts,
  viewCounts,
  groupCounts,
  onViewChange,
  onFilterChange,
  onOwnerFilterChange,
  onKindFilterChange,
  onPresentChange,
  onReset,
  onExport,
  onImport,
}: WorkToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("work-toolbar px-4 py-3 sm:px-6", boardToolbar)}>
      <div className="mx-auto flex max-w-[960px] flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={cn("text-sm font-semibold", boardTitle)}>
              {present
                ? "Delivery status"
                : view === "proof"
                  ? "Proven work"
                  : view === "all"
                    ? "All work"
                    : "Delivery status"}
            </p>
            <p className={cn("text-xs", boardFaint)}>
              {formatSavedAt(savedAt, now)} · {progress}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!present && view !== "now" && (
              <>
                <ToolbarButton
                  onClick={() => {
                    if (window.confirm("Replace this list with the full Phase 3 seed?")) onReset();
                  }}
                  icon={RotateCcw}
                  label="Load Phase 3"
                />
                <ToolbarButton onClick={onExport} icon={Download} label="Export" />
                <ToolbarButton onClick={() => fileRef.current?.click()} icon={Upload} label="Import" />
              </>
            )}
            <ToolbarButton onClick={() => window.print()} icon={Printer} label="Print / PDF" />
            <button
              type="button"
              onClick={() => onPresentChange(!present)}
              className={cn("px-3.5 py-1.5", boardChip)}
            >
              {present ? "Edit" : "Done"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && window.confirm("Replace this list with the imported file?")) onImport(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>
        {!present && (
          <div className="flex flex-wrap items-center gap-1.5">
            {VIEWS.map((item) => (
              <FilterChip
                key={item.id}
                label={item.label}
                count={viewCounts[item.id]}
                active={view === item.id}
                onClick={() => onViewChange(item.id)}
              />
            ))}
          </div>
        )}
        {view === "all" && !present && (
          <>
            <WorkNav counts={groupCounts} />
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "open", "doing", "blocked", "done"] as const).map((id) => (
                <FilterChip
                  key={id}
                  label={id === "all" ? "All" : id[0].toUpperCase() + id.slice(1)}
                  count={statusCounts[id]}
                  active={filter === id}
                  onClick={() => onFilterChange(id)}
                />
              ))}
              <span className={cn("mx-1 h-4 w-px", boardDivider)} />
              {(["all", "us", "brian", "waiting"] as const).map((id) => (
                <FilterChip
                  key={id}
                  label={id === "all" ? "Everyone" : id === "us" ? "Us" : id === "brian" ? "Brian" : "Waiting"}
                  count={ownerCounts[id]}
                  active={ownerFilter === id}
                  onClick={() => onOwnerFilterChange(id)}
                />
              ))}
              <span className={cn("mx-1 h-4 w-px", boardDivider)} />
              {(["all", "decision", "build", "dependency", "acceptance", "guardrail"] as const).map((id) => (
                <FilterChip
                  key={id}
                  label={id === "all" ? "Type" : id[0].toUpperCase() + id.slice(1)}
                  count={kindCounts[id]}
                  active={kindFilter === id}
                  onClick={() => onKindFilterChange(id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
