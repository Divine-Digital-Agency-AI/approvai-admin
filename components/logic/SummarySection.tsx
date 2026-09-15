"use client";

import { EditableField } from "./EditableField";
import { cn } from "@/lib/utils";
import type { BoardStatus } from "@/lib/logic/types";

const STATUSES: { id: BoardStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "ready", label: "Ready" },
  { id: "locked", label: "Locked" },
];

interface SummarySectionProps {
  title: string;
  subtitle: string;
  summary: string;
  boardStatus: BoardStatus;
  present: boolean;
  locked: boolean;
  showNotes?: boolean;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onStatusChange: (status: BoardStatus) => void;
}

export function SummarySection({
  title,
  subtitle,
  summary,
  boardStatus,
  present,
  locked,
  showNotes = false,
  onTitleChange,
  onSubtitleChange,
  onSummaryChange,
  onStatusChange,
}: SummarySectionProps) {
  const readOnly = present || locked;

  return (
    <header
      id="summary"
      className="scroll-mt-24 rounded-2xl border border-[#e4e4e4] bg-white px-6 py-6 sm:px-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Plan &amp; approvals
        </p>
        {present ? (
          <span className="rounded-full bg-[#edf5fc] px-2.5 py-0.5 text-xs font-medium text-primary">
            {STATUSES.find((status) => status.id === boardStatus)?.label}
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((status) => (
              <button
                key={status.id}
                type="button"
                onClick={() => onStatusChange(status.id)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  boardStatus === status.id
                    ? status.id === "locked"
                      ? "bg-[#1a1a1a] text-white"
                      : status.id === "ready"
                        ? "bg-[#e8f6ee] text-[#1b7a3d]"
                        : "bg-[#edf5fc] text-primary"
                    : "bg-[#f7f7f7] text-[#888]"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <EditableField
        value={title}
        onChange={onTitleChange}
        present={readOnly}
        rows={2}
        className="mt-3 text-2xl font-semibold leading-8 text-[#1a1a1a]"
      />
      <EditableField
        value={subtitle}
        onChange={onSubtitleChange}
        present={readOnly}
        rows={2}
        muted
        className="mt-2 text-[15px] leading-6"
      />
      {showNotes && (
        <div className="mt-5 rounded-xl bg-[#edf5fc] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">Notes</p>
          <EditableField
            value={summary}
            onChange={onSummaryChange}
            present={readOnly}
            rows={3}
            className="mt-2 text-[15px] leading-6 text-[#1a1a1a]"
          />
        </div>
      )}
    </header>
  );
}
