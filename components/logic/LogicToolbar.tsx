"use client";

import { Download, Printer, Redo2, Undo2 } from "lucide-react";
import { LogicNav } from "./LogicNav";
import { formatSavedAt } from "@/lib/logic/format";

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
      <div className="logic-toolbar print:hidden sticky top-0 z-20 border-b border-[#e4e4e4] bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Plan & approvals
            </p>
            <p className="text-sm text-[#5c5c5c]">{decisionLabel}</p>
          </div>
          <LogicNav present full={false} />
          <div className="flex items-center gap-2">
            <ToolbarButton onClick={() => window.print()} icon={Printer} label="Print / PDF" />
            <button
              type="button"
              onClick={() => onPresentChange(false)}
              className="rounded-full border border-[#e4e4e4] bg-white px-3.5 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f7f7f7]"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="logic-toolbar print:hidden sticky top-0 z-20 border-b border-[#e4e4e4] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {locked ? "Locked" : full ? "Full detail" : "Plan & approvals"}
            </p>
            <p className="text-xs text-[#888]">
              {formatSavedAt(savedAt, now)} · {decisionLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onFullChange(!full)}
              className="rounded-full border border-[#e4e4e4] bg-white px-3 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f7f7f7]"
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
              className="rounded-full border border-[#e4e4e4] bg-white px-3.5 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f7f7f7]"
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
      className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e4] bg-white px-3 py-1.5 text-sm text-[#1a1a1a] hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
