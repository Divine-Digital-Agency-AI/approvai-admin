"use client";

import { useCallback, useEffect, useState } from "react";
import { newId } from "@/lib/logic/ids";
import { createPhase3Work } from "@/lib/work/phase3-work";
import {
  loadSharedBoard,
  saveSharedBoard,
  subscribeToSharedBoard,
  unsubscribeFromSharedBoard,
} from "@/lib/boards/shared-board";
import {
  downloadWorkBoard,
  loadWorkBoard,
  parseWorkBoardFile,
  saveWorkBoard,
} from "@/lib/work/storage";
import type { WorkBoard, WorkOwner, WorkStatus, WorkTask } from "@/lib/work/types";

function stamp(board: WorkBoard): WorkBoard {
  return { ...board, updatedAt: new Date().toISOString() };
}

export function useWorkBoard() {
  const [board, setBoard] = useState<WorkBoard>(createPhase3Work);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    let frame = 0;
    const local = loadWorkBoard();

    void loadSharedBoard("work")
      .then((payload) => {
        const remote = payload ? parseWorkBoardFile(JSON.stringify(payload)) : null;
        if (!active) return;
        frame = window.requestAnimationFrame(() => {
          setBoard(remote ?? local);
          setReady(true);
        });
      })
      .catch((error: unknown) => {
        console.error("[Phase 3] Failed to load shared work:", error);
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
    saveWorkBoard(board);
    const timer = window.setTimeout(() => {
      void saveSharedBoard("work", board).catch((error: unknown) => {
        console.error("[Phase 3] Failed to save shared work:", error);
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [board, ready]);

  useEffect(() => {
    if (!ready) return;
    const channel = subscribeToSharedBoard("work", (payload) => {
      const incoming = parseWorkBoardFile(JSON.stringify(payload));
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

  const update = useCallback((patch: Partial<WorkBoard> | ((current: WorkBoard) => WorkBoard)) => {
    setBoard((current) => stamp(typeof patch === "function" ? patch(current) : { ...current, ...patch }));
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<WorkTask>) => {
    update((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
    }));
  }, [update]);

  const addTask = useCallback((group: string) => {
    update((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: newId("task"),
          group,
          stageId: "",
          title: "",
          detail: "",
          kind: "build",
          priority: "p1",
          milestone: "build",
          assignee: "Team",
          acceptance: "",
          evidence: "",
          source: "",
          dependsOn: [],
          notes: "",
          status: "open" satisfies WorkStatus,
          owner: "us" satisfies WorkOwner,
        },
      ],
    }));
  }, [update]);

  const removeTask = useCallback((taskId: string) => {
    update((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }));
  }, [update]);

  return {
    board,
    ready,
    savedAt: board.updatedAt,
    now,
    update,
    updateTask,
    addTask,
    removeTask,
    reset: () => setBoard(createPhase3Work()),
    exportJson: () => downloadWorkBoard(board),
    importJson: async (file: File) => {
      const parsed = parseWorkBoardFile(await file.text());
      if (parsed) setBoard(stamp(parsed));
    },
  };
}
