"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { newId } from "@/lib/logic/ids";
import { createPhase3Board } from "@/lib/logic/phase3-board";
import { duplicateStage, moveStage, renumberStages } from "@/lib/logic/stages";
import {
  loadSharedBoard,
  saveSharedBoard,
  subscribeToSharedBoard,
  unsubscribeFromSharedBoard,
} from "@/lib/boards/shared-board";
import {
  downloadLogicBoard,
  loadLogicBoard,
  parseLogicBoardFile,
  saveLogicBoard,
} from "@/lib/logic/storage";
import type { JourneyStage, LogicBoard } from "@/lib/logic/types";

function stamp(board: LogicBoard): LogicBoard {
  return { ...board, updatedAt: new Date().toISOString() };
}

export function useLogicBoard() {
  const [board, setBoard] = useState<LogicBoard>(createPhase3Board);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [past, setPast] = useState<LogicBoard[]>([]);
  const [future, setFuture] = useState<LogicBoard[]>([]);
  const pendingPast = useRef<LogicBoard | null>(null);
  const historyTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    let frame = 0;
    const local = loadLogicBoard();

    void loadSharedBoard("logic")
      .then((payload) => {
        const remote = payload ? parseLogicBoardFile(JSON.stringify(payload)) : null;
        if (!active) return;
        frame = window.requestAnimationFrame(() => {
          setBoard(remote ?? local);
          setReady(true);
        });
      })
      .catch((error: unknown) => {
        console.error("[Phase 3] Failed to load shared plan:", error);
        if (!active) return;
        frame = window.requestAnimationFrame(() => {
          setBoard(local);
          setReady(true);
        });
      });

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLogicBoard(board);
    const timer = window.setTimeout(() => {
      void saveSharedBoard("logic", board).catch((error: unknown) => {
        console.error("[Phase 3] Failed to save shared plan:", error);
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [board, ready]);

  useEffect(() => {
    if (!ready) return;
    const channel = subscribeToSharedBoard("logic", (payload) => {
      const incoming = parseLogicBoardFile(JSON.stringify(payload));
      if (!incoming) return;
      setBoard((current) =>
        new Date(incoming.updatedAt).getTime() > new Date(current.updatedAt).getTime() ? incoming : current
      );
    });
    return () => {
      void unsubscribeFromSharedBoard(channel);
    };
  }, [ready]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const flushHistory = useCallback(() => {
    if (historyTimer.current) {
      window.clearTimeout(historyTimer.current);
      historyTimer.current = null;
    }
    if (pendingPast.current) {
      setPast((current) => [...current.slice(-49), pendingPast.current as LogicBoard]);
      setFuture([]);
      pendingPast.current = null;
    }
  }, []);

  const commit = useCallback(
    (next: LogicBoard | ((current: LogicBoard) => LogicBoard), immediate = false) => {
      setBoard((current) => {
        if (!pendingPast.current) pendingPast.current = current;
        if (historyTimer.current) window.clearTimeout(historyTimer.current);
        if (immediate) {
          setPast((items) => [...items.slice(-49), pendingPast.current ?? current]);
          setFuture([]);
          pendingPast.current = null;
          historyTimer.current = null;
        } else {
          historyTimer.current = window.setTimeout(() => {
            if (pendingPast.current) {
              setPast((items) => [...items.slice(-49), pendingPast.current as LogicBoard]);
              setFuture([]);
              pendingPast.current = null;
            }
            historyTimer.current = null;
          }, 400);
        }
        return stamp(typeof next === "function" ? next(current) : next);
      });
    },
    []
  );

  const update = useCallback(
    (patch: Partial<LogicBoard> | ((current: LogicBoard) => LogicBoard)) => {
      commit((current) => (typeof patch === "function" ? patch(current) : { ...current, ...patch }));
    },
    [commit]
  );

  const replaceBoard = useCallback(
    (next: LogicBoard) => {
      commit(next, true);
    },
    [commit]
  );

  const undo = useCallback(() => {
    flushHistory();
    setPast((items) => {
      const previous = items[items.length - 1];
      if (!previous) return items;
      setBoard((current) => {
        setFuture((next) => [current, ...next].slice(0, 50));
        return previous;
      });
      return items.slice(0, -1);
    });
  }, [flushHistory]);

  const redo = useCallback(() => {
    setFuture((items) => {
      const [next, ...rest] = items;
      if (!next) return items;
      setBoard((current) => {
        setPast((prev) => [...prev.slice(-49), current]);
        return next;
      });
      return rest;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const addStage = useCallback(() => {
    commit(
      (current) => ({
        ...current,
        stages: renumberStages([
          ...current.stages,
          { id: newId("stage"), title: "Stage", customer: "", system: "", external: "" },
        ]),
      }),
      true
    );
  }, [commit]);

  const removeStage = useCallback((stageId: string) => {
    commit(
      (current) => ({
        ...current,
        stages: renumberStages(current.stages.filter((stage) => stage.id !== stageId)),
      }),
      true
    );
  }, [commit]);

  const updateStage = useCallback((stageId: string, patch: Partial<JourneyStage>) => {
    commit((current) => ({
      ...current,
      stages: current.stages.map((stage) => (stage.id === stageId ? { ...stage, ...patch } : stage)),
    }));
  }, [commit]);

  const shiftStage = useCallback((stageId: string, delta: -1 | 1) => {
    commit((current) => ({ ...current, stages: moveStage(current.stages, stageId, delta) }), true);
  }, [commit]);

  const copyStage = useCallback((stageId: string) => {
    commit((current) => ({ ...current, stages: duplicateStage(current.stages, stageId) }), true);
  }, [commit]);

  return {
    board,
    ready,
    savedAt: board.updatedAt,
    now,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    update,
    undo,
    redo,
    resetPhase3: () => replaceBoard(createPhase3Board()),
    exportJson: () => downloadLogicBoard(board),
    importJson: async (file: File) => {
      const parsed = parseLogicBoardFile(await file.text());
      if (parsed) replaceBoard(parsed);
    },
    addStage,
    removeStage,
    updateStage,
    shiftStage,
    copyStage,
  };
}
