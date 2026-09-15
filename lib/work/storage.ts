import { createPhase3Work, WORK_SEED_VERSION } from "./phase3-work";
import type {
  WorkBoard,
  WorkKind,
  WorkMilestone,
  WorkOwner,
  WorkPriority,
  WorkStatus,
  WorkTask,
} from "./types";

export const WORK_STORAGE_KEY = "approvai.work.board.v1";

const STATUSES: WorkStatus[] = ["open", "doing", "blocked", "done"];
const OWNERS: WorkOwner[] = ["us", "brian", "waiting"];
const KINDS: WorkKind[] = ["decision", "build", "dependency", "acceptance", "guardrail"];
const PRIORITIES: WorkPriority[] = ["p0", "p1", "p2"];
const MILESTONES: WorkMilestone[] = ["align", "build", "verify", "release"];

function isBoard(value: unknown): value is WorkBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as WorkBoard;
  return typeof board.id === "string" && typeof board.title === "string" && Array.isArray(board.tasks);
}

function overlayTask(task: WorkTask, prev: WorkTask): WorkTask {
  return {
    ...task,
    notes: prev.notes ?? task.notes,
    assignee: prev.assignee && prev.assignee !== "Team" ? prev.assignee : task.assignee,
    acceptance: prev.acceptance || task.acceptance,
    evidence: prev.evidence ?? task.evidence,
    status:
      task.id === "align-board"
        ? task.status
        : STATUSES.includes(prev.status)
          ? prev.status
          : task.status,
  };
}

function normalizeTask(task: WorkTask): WorkTask {
  return {
    id: task.id,
    group: task.group || "Work",
    stageId: task.stageId ?? "",
    title: task.title ?? "",
    detail: task.detail ?? "",
    kind: KINDS.includes(task.kind) ? task.kind : "build",
    priority: PRIORITIES.includes(task.priority) ? task.priority : "p1",
    milestone: MILESTONES.includes(task.milestone) ? task.milestone : "build",
    assignee: task.assignee ?? "",
    acceptance: task.acceptance ?? "",
    evidence: task.evidence ?? "",
    source: task.source ?? "",
    dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn.filter((id) => typeof id === "string") : [],
    notes: task.notes ?? "",
    status: STATUSES.includes(task.status) ? task.status : "open",
    owner: OWNERS.includes(task.owner) ? task.owner : "us",
  };
}

export function normalizeWorkBoard(board: WorkBoard): WorkBoard {
  const defaults = createPhase3Work();
  return {
    ...defaults,
    ...board,
    version: typeof board.version === "number" ? board.version : WORK_SEED_VERSION,
    tasks: board.tasks.map((task) => normalizeTask(task)),
  };
}

const OLD_TASK_IDS: Record<string, string> = {
  "start-home": "start-find",
  "start-thread": "start-chat",
  "gather-plans": "gather-read",
  "prefill-forms": "prefill-noc",
  "review-brian": "review-label",
  "approvals-sign": "approvals-send",
};

export function mergeWorkSeed(saved: WorkBoard): WorkBoard {
  const seed = createPhase3Work();
  const savedVersion = typeof saved.version === "number" ? saved.version : 0;
  if (savedVersion >= WORK_SEED_VERSION) {
    return normalizeWorkBoard(saved);
  }

  const prevById = new Map(saved.tasks.map((task) => [task.id, task]));
  const seedIds = new Set(seed.tasks.map((task) => task.id));
  const extras = saved.tasks
    .filter((task) => !seedIds.has(task.id) && !OLD_TASK_IDS[task.id])
    .map((task) => normalizeTask(task));

  return normalizeWorkBoard({
    ...seed,
    title: seed.title,
    subtitle: seed.subtitle,
    tasks: [
      ...seed.tasks.map((task) => {
        const oldId = Object.keys(OLD_TASK_IDS).find((id) => OLD_TASK_IDS[id] === task.id);
        const prev = prevById.get(task.id) ?? (oldId ? prevById.get(oldId) : undefined);
        return prev ? overlayTask(task, prev) : task;
      }),
      ...extras,
    ],
  });
}

export function loadWorkBoard(): WorkBoard {
  if (typeof window === "undefined") return createPhase3Work();
  try {
    const raw = window.localStorage.getItem(WORK_STORAGE_KEY);
    if (!raw) return createPhase3Work();
    const parsed: unknown = JSON.parse(raw);
    if (!isBoard(parsed)) return createPhase3Work();
    return mergeWorkSeed(parsed);
  } catch {
    return createPhase3Work();
  }
}

export function saveWorkBoard(board: WorkBoard): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(board));
}

export function downloadWorkBoard(board: WorkBoard): void {
  const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${board.id || "work-board"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseWorkBoardFile(text: string): WorkBoard | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isBoard(parsed) ? mergeWorkSeed(parsed) : null;
  } catch {
    return null;
  }
}
