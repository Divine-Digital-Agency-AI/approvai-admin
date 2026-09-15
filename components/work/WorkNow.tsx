"use client";

import { WorkTaskCard } from "./WorkTaskCard";
import { NEXT_LIMIT, NOW_LANES, nowCounts, nowLanes } from "@/lib/work/now";
import type { WorkTask } from "@/lib/work/types";

interface WorkNowProps {
  tasks: WorkTask[];
  present: boolean;
  onChange: (taskId: string, patch: Partial<WorkTask>) => void;
  onSeeAll: () => void;
}

export function WorkNow({ tasks, present, onChange, onSeeAll }: WorkNowProps) {
  const lanes = nowLanes(tasks);
  const counts = nowCounts(tasks);

  return (
    <div className="flex flex-col gap-8">
      {NOW_LANES.map((lane) => {
        const items = lanes[lane.id];
        const leftover = lane.id === "next" ? Math.max(0, counts.next - NEXT_LIMIT) : 0;
        return (
          <section key={lane.id} id={`now-${lane.id}`} className="scroll-mt-36">
            <div className="mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary">
                {lane.name}
                <span className="ml-2 font-medium normal-case tracking-normal text-[#888]">{items.length}</span>
              </h2>
              <p className="mt-1 text-sm text-[#888]">{lane.hint}</p>
            </div>
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#e4e4e4] bg-white px-4 py-5 text-sm text-[#888]">
                Nothing here.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((task) => (
                  <WorkTaskCard
                    key={task.id}
                    task={task}
                    present={present}
                    compact
                    onChange={(patch) => onChange(task.id, patch)}
                    onRemove={() => undefined}
                  />
                ))}
              </div>
            )}
            {leftover > 0 && !present && (
              <button
                type="button"
                onClick={onSeeAll}
                className="mt-3 text-sm font-medium text-primary hover:text-primary-hover"
              >
                {leftover} more in All work
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
