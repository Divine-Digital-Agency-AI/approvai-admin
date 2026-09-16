"use client";

import { EditableField } from "./EditableField";
import {
  boardCard,
  boardIdleChip,
  boardInfoChip,
  boardSoft,
  boardTitle,
  boardYesChip,
} from "@/lib/themed-surfaces";
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
      className={cn("scroll-mt-24 px-6 py-6 sm:px-8", boardCard)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Plan &amp; approvals
        </p>
        {present ? (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", boardInfoChip)}>
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
                      ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]"
                      : status.id === "ready"
                        ? boardYesChip
                        : boardInfoChip
                    : boardIdleChip
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
        className={cn("mt-3 text-2xl font-semibold leading-8", boardTitle)}
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
        <div className={cn("mt-5 rounded-xl p-4", boardSoft)}>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-primary">Notes</p>
          <EditableField
            value={summary}
            onChange={onSummaryChange}
            present={readOnly}
            rows={3}
            className={cn("mt-2 text-[15px] leading-6", boardTitle)}
          />
        </div>
      )}
    </header>
  );
}
