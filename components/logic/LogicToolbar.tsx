"use client";

import { Download, Printer, Redo2, Undo2 } from "lucide-react";
import { LogicNav } from "./LogicNav";
import { formatSavedAt } from "@/lib/logic/format";
import { boardChip, boardFaint, boardMuted, boardTitle, boardToolbar } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

interface LogicToolbarProps {
  present: boolean;
  full: boolean;
  locked: boolean;
  savedAt: string;
  now: number;
  canUndo: boolean;
  canRedo: boolean;
  decisionLabel: string;
  onFullChange: (full: boolean) => void;
  onPresentChange: (present: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

export function LogicToolbar({
  present,
  full,
  locked,
  savedAt,
  now,
  canUndo,
  canRedo,
  decisionLabel,
  onFullChange,
  onPresentChange,
  onUndo,
  onRedo,
  onExport,
}: LogicToolbarProps) {
  if (present) {
    return (
      <div className={cn("logic-toolbar px-4 py-3 sm:px-6", boardToolbar)}>
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Plan & approvals
            </p>
            <p className={cn("text-sm", boardMuted)}>{decisionLabel}</p>
          </div>
          <LogicNav present full={false} />
          <div className="flex items-center gap-2">
            <ToolbarButton onClick={() => window.print()} icon={Printer} label="Print / PDF" />
            <button
              type="button"
              onClick={() => onPresentChange(false)}
              className={cn("px-3.5 py-1.5", boardChip)}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("logic-toolbar px-4 py-3 sm:px-6", boardToolbar)}>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={cn("text-sm font-semibold", boardTitle)}>
              {locked ? "Locked" : full ? "Full detail" : "Plan & approvals"}
            </p>
            <p className={cn("text-xs", boardFaint)}>
              {formatSavedAt(savedAt, now)} · {decisionLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onFullChange(!full)}
              className={cn("px-3 py-1.5", boardChip)}
            >
              {full ? "Plan" : "Full details"}
            </button>
            <ToolbarButton onClick={onUndo} icon={Undo2} label="Undo" disabled={!canUndo} />
            <ToolbarButton onClick={onRedo} icon={Redo2} label="Redo" disabled={!canRedo} />
            <ToolbarButton onClick={onExport} icon={Download} label="Export JSON" />
            <ToolbarButton onClick={() => window.print()} icon={Printer} label="Print / PDF" />
            <button
              type="button"
              onClick={() => onPresentChange(true)}
              className={cn("px-3.5 py-1.5", boardChip)}
            >
              Done
            </button>
          </div>
        </div>
        <LogicNav present={false} full={full} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: typeof Download;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40",
        boardChip
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
