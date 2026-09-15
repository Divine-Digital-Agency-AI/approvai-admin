"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { DeliverySlices } from "./DeliverySlices";
import { WorkBoardHeader } from "./WorkBoardHeader";
import { WorkNow } from "./WorkNow";
import { WorkTaskCard } from "./WorkTaskCard";
import { WorkToolbar, type WorkView } from "./WorkToolbar";
import { useWorkBoard } from "@/hooks/useWorkBoard";
import { WORK_GROUPS, workGroupId } from "@/lib/work/groups";
import { nowCounts, PROOF_GROUP } from "@/lib/work/now";
import type { WorkKind, WorkOwner, WorkStatus } from "@/lib/work/types";

function readView(value: string | null, stage: string): WorkView {
  if (value === "all" || value === "proof" || value === "now") return value;
  return stage ? "all" : "now";
}

export function WorkWorkspace() {
  const [present, setPresent] = useState(true);
  const [filter, setFilter] = useState<WorkStatus | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<WorkOwner | "all">("all");
  const [kindFilter, setKindFilter] = useState<WorkKind | "all">("all");
  const router = useRouter();
  const search = useSearchParams();
  const stageFilter = search.get("stage") ?? "";
  const urlView = readView(search.get("view"), stageFilter);
  const [localView, setLocalView] = useState<WorkView | null>(null);
  const view = localView ?? urlView;
  const { board, ready, savedAt, now, update, updateTask, addTask, removeTask, reset, exportJson, importJson } =
    useWorkBoard();

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.classList.add("light");
    return () => {
      root.classList.remove("light");
      if (hadDark) root.classList.add("dark");
    };
  }, []);

  const counts = useMemo(() => nowCounts(board.tasks), [board.tasks]);
  const statusCounts = useMemo(() => {
    const next = { all: 0, open: 0, doing: 0, blocked: 0, done: 0 };
    for (const task of board.tasks) {
      if (task.group === PROOF_GROUP) continue;
      next.all += 1;
      next[task.status] += 1;
    }
    return next;
  }, [board.tasks]);
  const ownerCounts = useMemo(() => {
    const next = { all: 0, us: 0, brian: 0, waiting: 0 };
    for (const task of board.tasks) {
      if (task.group === PROOF_GROUP) continue;
      next.all += 1;
      next[task.owner] += 1;
    }
    return next;
  }, [board.tasks]);
  const kindCounts = useMemo(() => {
    const next = { all: 0, decision: 0, build: 0, dependency: 0, acceptance: 0, guardrail: 0 };
    for (const task of board.tasks) {
      if (task.group === PROOF_GROUP) continue;
      next.all += 1;
      next[task.kind] += 1;
    }
    return next;
  }, [board.tasks]);
  const groupCounts = useMemo(() => {
    const next: Record<string, { done: number; total: number }> = {};
    for (const task of board.tasks) {
      if (task.group === PROOF_GROUP) continue;
      const current = next[task.group] ?? { done: 0, total: 0 };
      current.total += 1;
      if (task.status === "done") current.done += 1;
      next[task.group] = current;
    }
    return next;
  }, [board.tasks]);

  const groups = useMemo(() => {
    const visible = board.tasks.filter((task) => {
      if (view === "proof") return task.group === PROOF_GROUP;
      if (task.group === PROOF_GROUP) return false;
      const statusOk = filter === "all" || task.status === filter;
      const ownerOk = ownerFilter === "all" || task.owner === ownerFilter;
      const kindOk = kindFilter === "all" || task.kind === kindFilter;
      const stageOk = !stageFilter || task.stageId === stageFilter;
      return statusOk && ownerOk && kindOk && stageOk;
    });
    const names =
      view === "proof"
        ? [PROOF_GROUP]
        : [
            ...WORK_GROUPS.map((group) => group.name).filter(
              (name) => name !== PROOF_GROUP && visible.some((task) => task.group === name)
            ),
          ];
    return names.map((name) => ({
      name,
      id: workGroupId(name),
      tasks: visible.filter((task) => task.group === name),
    }));
  }, [board.tasks, filter, kindFilter, ownerFilter, stageFilter, view]);

  const setView = (next: WorkView) => {
    setLocalView(next);
    const params = new URLSearchParams();
    if (next !== "now") params.set("view", next);
    if (next === "all" && stageFilter) params.set("stage", stageFilter);
    router.replace(params.size ? `/phase-3/now?${params.toString()}` : "/phase-3/now");
  };

  if (!ready) {
    return <div className="min-h-[50vh] bg-[#f7f7f7]" />;
  }

  return (
    <div className="work-board min-h-full bg-[#f7f7f7] text-[#1a1a1a]">
      <WorkToolbar
        view={present ? "now" : view}
        present={present}
        savedAt={savedAt}
        now={now}
        progress={`${counts.brian} require input · ${counts.doing} in progress · ${counts.blocked} waiting`}
        filter={filter}
        ownerFilter={ownerFilter}
        kindFilter={kindFilter}
        statusCounts={statusCounts}
        ownerCounts={ownerCounts}
        kindCounts={kindCounts}
        viewCounts={{ now: counts.active, all: counts.phase3, proof: counts.proven }}
        groupCounts={groupCounts}
        onViewChange={setView}
        onFilterChange={setFilter}
        onOwnerFilterChange={setOwnerFilter}
        onKindFilterChange={setKindFilter}
        onPresentChange={setPresent}
        onReset={reset}
        onExport={exportJson}
        onImport={importJson}
      />

      <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-8 sm:px-6">
        <WorkBoardHeader
          board={board}
          present={present}
          stageFilter={view === "all" ? stageFilter : ""}
          summary={
            present || view === "now"
              ? ""
              : view === "proof"
                ? `${counts.proven} Phase 2 proofs. Do not regress.`
                : `${counts.phase3} Phase 3 items. Proofs are under Proven.`
          }
          onChange={update}
          onClearStage={() => setView("all")}
        />

        {(present || view === "now") && <DeliverySlices tasks={board.tasks} present={present} />}

        {(present || view === "now") && (
          <WorkNow
            tasks={board.tasks}
            present={present}
            onChange={updateTask}
            onSeeAll={() => setView("all")}
          />
        )}

        {!present && view !== "now" &&
          groups.map((group) => (
            <section key={group.name} id={`work-${group.id}`} className="scroll-mt-36">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-primary">
                  {group.name}
                  <span className="ml-2 font-medium normal-case tracking-normal text-[#888]">
                    {group.tasks.length}
                  </span>
                </h2>
                {view === "all" && (
                  <button
                    type="button"
                    onClick={() => addTask(group.name)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add task
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {group.tasks.map((task) => (
                  <WorkTaskCard
                    key={task.id}
                    task={task}
                    present={present}
                    onChange={(patch) => updateTask(task.id, patch)}
                    onRemove={() => removeTask(task.id)}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
