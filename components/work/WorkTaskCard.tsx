"use client";

import { X } from "lucide-react";
import { EditableField } from "@/components/logic/EditableField";
import { cn } from "@/lib/utils";
import { nextAction } from "@/lib/work/now";
import type { WorkOwner, WorkStatus, WorkTask } from "@/lib/work/types";
import { WorkTaskDetails } from "./WorkTaskDetails";

const STATUSES: { id: WorkStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "doing", label: "Doing" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

const OWNERS: { id: WorkOwner; label: string }[] = [
  { id: "us", label: "Us" },
  { id: "brian", label: "Brian" },
  { id: "waiting", label: "Waiting" },
];

interface WorkTaskCardProps {
  task: WorkTask;
  present: boolean;
  compact?: boolean;
  onChange: (patch: Partial<WorkTask>) => void;
  onRemove: () => void;
}

function statusClass(id: WorkStatus, active: boolean) {
  if (!active) return "bg-[#f7f7f7] text-[#888]";
  if (id === "done") return "bg-[#e8f6ee] text-[#1b7a3d]";
  if (id === "blocked") return "bg-[#fdecec] text-[#b42318]";
  if (id === "doing") return "bg-[#edf5fc] text-primary";
  return "bg-[#f3f3f3] text-[#1a1a1a]";
}

export function WorkTaskCard({ task, present, compact = false, onChange, onRemove }: WorkTaskCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-4",
        task.status === "done"
          ? "border-[#d8eee2]"
          : task.status === "blocked"
            ? "border-[#f3c4c0]"
            : "border-[#e4e4e4]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <EditableField
            value={task.title}
            onChange={(title) => onChange({ title })}
            present={present}
            rows={1}
            placeholder=""
            className={cn(
              "text-base font-semibold text-[#1a1a1a]",
              task.status === "done" && "text-[#5c5c5c] line-through"
            )}
          />
          {!compact && (
            <EditableField
              value={task.detail}
              onChange={(detail) => onChange({ detail })}
              present={present}
              rows={2}
              muted
              placeholder=""
              className="mt-1 text-sm"
            />
          )}
          <p className="mt-2 text-sm text-[#5c5c5c]">
            <span className="font-medium text-[#1a1a1a]">
              {OWNERS.find((owner) => owner.id === task.owner)?.label}
            </span>
            {nextAction(task) ? ` · ${nextAction(task)}` : ""}
          </p>
        </div>
        {!present && !compact && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-[#999] hover:bg-black/5 hover:text-[#1a1a1a]"
            aria-label={`Remove ${task.title || "task"}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {present ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className={cn("rounded-full px-2.5 py-0.5", statusClass(task.status, true))}>
            {STATUSES.find((status) => status.id === task.status)?.label}
          </span>
          <span className="rounded-full bg-[#fff4ec] px-2.5 py-0.5 text-[#c45c26]">
            {OWNERS.find((owner) => owner.id === task.owner)?.label}
          </span>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {STATUSES.map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => onChange({ status: status.id })}
              className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusClass(status.id, task.status === status.id))}
            >
              {status.label}
            </button>
          ))}
          <span className="mx-1 h-3 w-px bg-[#e4e4e4]" />
          {OWNERS.map((owner) => (
            <button
              key={owner.id}
              type="button"
              onClick={() => onChange({ owner: owner.id })}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                task.owner === owner.id ? "bg-[#fff4ec] text-[#c45c26]" : "bg-[#f7f7f7] text-[#888]"
              )}
            >
              {owner.label}
            </button>
          ))}
        </div>
      )}
      {!compact && (!present || task.notes.trim()) && (
        <EditableField
          value={task.notes}
          onChange={(notes) => onChange({ notes })}
          present={present}
          rows={1}
          muted
          placeholder=""
          className="mt-3 text-sm"
        />
      )}
      {!compact && !present && <WorkTaskDetails task={task} present={false} onChange={onChange} />}
    </article>
  );
}
