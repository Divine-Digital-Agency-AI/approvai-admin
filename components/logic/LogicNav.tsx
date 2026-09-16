"use client";

import { boardNavChip, boardNavChipPresent } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";

export const PLAN_SECTIONS = [
  { id: "summary", label: "Outcome" },
  { id: "picture", label: "Journey" },
  { id: "decisions", label: "Approvals" },
  { id: "next", label: "Next action" },
] as const;

export const FULL_SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "overview", label: "Overview" },
  { id: "picture", label: "Picture" },
  { id: "journey", label: "Journey" },
  { id: "logic", label: "Gates" },
  { id: "decisions", label: "Decisions" },
  { id: "scope", label: "Scope" },
  { id: "done", label: "Done" },
] as const;

export function scrollToLogicSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface LogicNavProps {
  present: boolean;
  full?: boolean;
}

export function LogicNav({ present, full = false }: LogicNavProps) {
  const sections = full ? FULL_SECTIONS : PLAN_SECTIONS;
  return (
    <nav
      className={cn("print:hidden flex flex-wrap gap-2", present && "justify-center")}
      aria-label="Plan sections"
    >
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToLogicSection(section.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            present ? boardNavChipPresent : boardNavChip
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
