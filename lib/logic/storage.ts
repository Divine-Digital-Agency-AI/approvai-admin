import { createPhase3Board, LOGIC_SEED_VERSION } from "./phase3-board";
import type { BoardStatus, DecisionItem, DecisionStatus, LogicBoard } from "./types";

export const LOGIC_STORAGE_KEY = "approvai.logic.board.v1";

const DECISION_STATUSES: DecisionStatus[] = ["open", "yes", "no"];
const BOARD_STATUSES: BoardStatus[] = ["draft", "ready", "locked"];

function isBoard(value: unknown): value is LogicBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as LogicBoard;
  return (
    typeof board.id === "string" &&
    typeof board.title === "string" &&
    Array.isArray(board.stages) &&
    Array.isArray(board.compare) &&
    Array.isArray(board.decisions)
  );
}

function normalizeDecision(item: DecisionItem): DecisionItem {
  const status = DECISION_STATUSES.includes(item.status) ? item.status : "open";
  return { id: item.id, text: item.text ?? "", note: item.note ?? "", status };
}

function stringList(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.length > 0 ? value.map((item) => String(item)) : fallback;
}

export function normalizeLogicBoard(board: LogicBoard): LogicBoard {
  const defaults = createPhase3Board();
  return {
    ...defaults,
    ...board,
    version: typeof board.version === "number" ? board.version : LOGIC_SEED_VERSION,
    boardStatus: BOARD_STATUSES.includes(board.boardStatus)
      ? board.boardStatus
      : board.id === "phase-3"
        ? "ready"
        : "draft",
    summary: board.summary ?? defaults.summary,
    inScope: stringList(board.inScope, defaults.inScope),
    phase4: stringList(board.phase4, defaults.phase4),
    assumptions: stringList(board.assumptions, defaults.assumptions),
    decisions: board.decisions.map((item) => normalizeDecision(item)),
  };
}

function mergeLogicSeed(saved: LogicBoard): LogicBoard {
  const seed = createPhase3Board();
  const savedVersion = typeof saved.version === "number" ? saved.version : 0;
  if (savedVersion >= LOGIC_SEED_VERSION || saved.id !== seed.id) {
    return normalizeLogicBoard(saved);
  }
  return normalizeLogicBoard({
    ...saved,
    version: LOGIC_SEED_VERSION,
    updatedAt: new Date().toISOString(),
    title: seed.title,
    subtitle: seed.subtitle,
    summary: seed.summary,
    compareEyebrow: seed.compareEyebrow,
    compareTitle: seed.compareTitle,
    journeyEyebrow: seed.journeyEyebrow,
    journeyTitle: seed.journeyTitle,
    journeyHint: seed.journeyHint,
    gatesEyebrow: seed.gatesEyebrow,
    gatesTitle: seed.gatesTitle,
    decisionsEyebrow: seed.decisionsEyebrow,
    decisionsTitle: seed.decisionsTitle,
    decisionsHint: seed.decisionsHint,
    decisions: seed.decisions.map((decision) => {
      const previous = saved.decisions.find((item) => item.id === decision.id);
      return previous ? { ...decision, status: previous.status } : decision;
    }),
    dodEyebrow: seed.dodEyebrow,
    dodTitle: seed.dodTitle,
  });
}

export function loadLogicBoard(): LogicBoard {
  if (typeof window === "undefined") return createPhase3Board();
  try {
    const raw = window.localStorage.getItem(LOGIC_STORAGE_KEY);
    if (!raw) return createPhase3Board();
    const parsed: unknown = JSON.parse(raw);
    if (!isBoard(parsed)) return createPhase3Board();
    return mergeLogicSeed(parsed);
  } catch {
    return createPhase3Board();
  }
}

export function saveLogicBoard(board: LogicBoard): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOGIC_STORAGE_KEY, JSON.stringify(board));
}

export function downloadLogicBoard(board: LogicBoard): void {
  const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${board.id || "logic-board"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseLogicBoardFile(text: string): LogicBoard | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isBoard(parsed) ? mergeLogicSeed(parsed) : null;
  } catch {
    return null;
  }
}
