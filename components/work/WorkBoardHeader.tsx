"use client";

import { EditableField } from "@/components/logic/EditableField";
import { boardCard, boardMuted, boardSoft, boardTitle } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";
import type { WorkBoard } from "@/lib/work/types";

interface WorkBoardHeaderProps {
  board: WorkBoard;
  present: boolean;
  stageFilter: string;
  summary: string;
  onChange: (patch: Partial<WorkBoard>) => void;
  onClearStage: () => void;
}

export function WorkBoardHeader({
  board,
  present,
  stageFilter,
  summary,
  onChange,
  onClearStage,
}: WorkBoardHeaderProps) {
  return (
    <>
      {stageFilter && (
        <div className={cn("flex items-center justify-between rounded-xl border border-primary/20 px-4 py-3", boardSoft)}>
          <p className="text-sm font-medium text-primary">
            Showing work linked to <span className="capitalize">{stageFilter}</span>
          </p>
          <button
            type="button"
            onClick={onClearStage}
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Show all
          </button>
        </div>
      )}
      <header className={cn("px-6 py-6", boardCard)}>
        {present && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Delivery status
          </p>
        )}
        <EditableField
          value={board.title}
          onChange={(title) => onChange({ title })}
          present={present}
          rows={1}
          className={cn("text-2xl font-semibold leading-8", boardTitle)}
        />
        <EditableField
          value={board.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
          present={present}
          rows={2}
          muted
          className="mt-2 text-[15px] leading-6"
        />
        {summary && summary !== board.subtitle && (
          <p className={cn("mt-4 text-sm", boardMuted)}>{summary}</p>
        )}
      </header>
    </>
  );
}
