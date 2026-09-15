import type { WorkTask } from "./types";

export const PROOF_GROUP = "Phase 2 proof";

export const NEXT_LIMIT = 8;

export const NOW_LANES = [
  { id: "brian", name: "Your input", hint: "Items requiring your review or decision." },
  { id: "doing", name: "In progress", hint: "Work currently underway." },
  { id: "blocked", name: "Waiting", hint: "Waiting on information or a file." },
  { id: "next", name: "Next to review", hint: "The next items we plan to bring forward." },
] as const;

export type NowLaneId = (typeof NOW_LANES)[number]["id"];

const PRIORITY_RANK = { p0: 0, p1: 1, p2: 2 };
const KIND_RANK = { decision: 0, dependency: 1, guardrail: 2, acceptance: 3, build: 4 };
const GROUP_RANK: Record<string, number> = {
  "Brian sign-off": 0,
  "1 · Find project and start chat": 1,
  "2 · Identify requirements": 2,
  "3 · Prefill documents": 3,
  "4 · Review like Brian": 4,
  "5 · Signature and tracking": 5,
  "6 · Complete packet": 6,
  "Release criteria": 7,
};

export function isActiveWork(task: WorkTask): boolean {
  return task.group !== PROOF_GROUP && task.status !== "done";
}

export function nextAction(task: WorkTask): string {
  return task.notes.trim() || task.detail.trim() || task.acceptance.trim();
}

export function sortNow(tasks: WorkTask[]): WorkTask[] {
  return [...tasks].sort((left, right) => {
    const group = (GROUP_RANK[left.group] ?? 99) - (GROUP_RANK[right.group] ?? 99);
    if (group !== 0) return group;
    const kind = KIND_RANK[left.kind] - KIND_RANK[right.kind];
    if (kind !== 0) return kind;
    const priority = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
    if (priority !== 0) return priority;
    return left.title.localeCompare(right.title);
  });
}

export function nowLanes(tasks: WorkTask[]): Record<NowLaneId, WorkTask[]> {
  const live = tasks.filter(isActiveWork);
  return {
    brian: sortNow(live.filter((task) => task.owner === "brian")),
    doing: sortNow(live.filter((task) => task.status === "doing" && task.owner !== "brian")),
    blocked: sortNow(live.filter((task) => task.status === "blocked" && task.owner !== "brian")),
    next: sortNow(
      live.filter((task) => task.status === "open" && task.owner === "us" && task.kind !== "guardrail")
    ).slice(0, NEXT_LIMIT),
  };
}

export function nowCounts(tasks: WorkTask[]) {
  const lanes = nowLanes(tasks);
  const nextAll = tasks.filter(
    (task) => isActiveWork(task) && task.status === "open" && task.owner === "us" && task.kind !== "guardrail"
  ).length;
  return {
    brian: lanes.brian.length,
    doing: lanes.doing.length,
    blocked: lanes.blocked.length,
    next: nextAll,
    proven: tasks.filter((task) => task.group === PROOF_GROUP).length,
    phase3: tasks.filter((task) => task.group !== PROOF_GROUP).length,
    active: tasks.filter(isActiveWork).length,
  };
}
