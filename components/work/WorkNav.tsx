"use client";

import { boardFaint, boardNavChip, boardNavChipPresent } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";
import { scrollToWorkGroup, WORK_GROUPS } from "@/lib/work/groups";

interface WorkNavProps {
  present?: boolean;
  counts?: Record<string, { done: number; total: number }>;
}

export function WorkNav({ present = false, counts }: WorkNavProps) {
  return (
    <nav
      className={cn("print:hidden flex flex-wrap gap-1.5", present && "justify-center")}
      aria-label="Work groups"
    >
      {WORK_GROUPS.filter((group) => !counts || counts[group.name]).map((group) => {
        const count = counts?.[group.name];
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => scrollToWorkGroup(group.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              present ? boardNavChipPresent : boardNavChip
            )}
          >
            {group.name}
            {count ? (
              <span className={cn("ml-1.5", boardFaint)}>
                {count.done}/{count.total}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
