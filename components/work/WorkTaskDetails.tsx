"use client";

import { EditableField } from "@/components/logic/EditableField";
import { boardFaint, boardMuted } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";
import type { WorkKind, WorkMilestone, WorkPriority, WorkTask } from "@/lib/work/types";

const KIND_LABELS: Record<WorkKind, string> = {
  decision: "Decision",
  build: "Build",
  dependency: "Dependency",
  acceptance: "Acceptance",
  guardrail: "Guardrail",
};

const MILESTONE_LABELS: Record<WorkMilestone, string> = {
  align: "Align",
  build: "Build",
  verify: "Verify",
  release: "Release",
};

interface WorkTaskDetailsProps {
  task: WorkTask;
  present: boolean;
  onChange: (patch: Partial<WorkTask>) => void;
}

export function WorkTaskDetails({ task, present, onChange }: WorkTaskDetailsProps) {
  return (
    <details className="mt-3 border-t border-[#ededed] pt-3 dark:border-[#2a2a2a]" open={present && task.kind === "acceptance"}>
      <summary className="cursor-pointer text-xs font-medium text-primary">
        Details
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <MetaSelect
          label="Type"
          value={task.kind}
          present={present}
          options={KIND_LABELS}
          onChange={(kind) => onChange({ kind: kind as WorkKind })}
        />
        <MetaSelect
          label="Priority"
          value={task.priority}
          present={present}
          options={{ p0: "P0 · must work", p1: "P1 · should work", p2: "P2 · later" }}
          onChange={(priority) => onChange({ priority: priority as WorkPriority })}
        />
        <MetaSelect
          label="Milestone"
          value={task.milestone}
          present={present}
          options={MILESTONE_LABELS}
          onChange={(milestone) => onChange({ milestone: milestone as WorkMilestone })}
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <MetaField
          label="Specific assignee"
          value={task.assignee}
          present={present}
          placeholder=""
          onChange={(assignee) => onChange({ assignee })}
        />
        <MetaField
          label="Depends on"
          value={task.dependsOn.join(", ")}
          present={present}
          placeholder=""
          onChange={(value) =>
            onChange({ dependsOn: value.split(",").map((id) => id.trim()).filter(Boolean) })
          }
        />
      </div>
      <MetaField
        label="Done means"
        value={task.acceptance}
        present={present}
        placeholder=""
        onChange={(acceptance) => onChange({ acceptance })}
      />
      <MetaField
        label="Proof"
        value={task.evidence}
        present={present}
        placeholder=""
        onChange={(evidence) => onChange({ evidence })}
      />
      <MetaField
        label="Source"
        value={task.source}
        present={present}
        placeholder=""
        onChange={(source) => onChange({ source })}
      />
    </details>
  );
}

function MetaField({
  label,
  value,
  present,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  present: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-3 block">
      <span className={cn("text-[11px] font-semibold uppercase tracking-[0.05em]", boardFaint)}>{label}</span>
      <EditableField
        value={value}
        onChange={onChange}
        present={present}
        rows={1}
        muted
        placeholder={placeholder}
        className="mt-1 text-sm"
      />
    </label>
  );
}

function MetaSelect({
  label,
  value,
  present,
  options,
  onChange,
}: {
  label: string;
  value: string;
  present: boolean;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className={cn("text-[11px] font-semibold uppercase tracking-[0.05em]", boardFaint)}>{label}</span>
      {present ? (
        <p className={cn("mt-1 text-sm", boardMuted)}>{options[value]}</p>
      ) : (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[#e4e4e4] bg-white px-2 py-1.5 text-sm dark:border-[#333333] dark:bg-[#0d0d0d] dark:text-white"
        >
          {Object.entries(options).map(([id, optionLabel]) => (
            <option key={id} value={id}>
              {optionLabel}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}
