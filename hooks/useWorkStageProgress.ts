"use client";

import { useEffect, useState } from "react";
import { loadWorkBoard, WORK_STORAGE_KEY } from "@/lib/work/storage";

export interface StageWorkProgress {
  done: number;
  blocked: number;
  total: number;
}

export function useWorkStageProgress(): Record<string, StageWorkProgress> {
  const [progress, setProgress] = useState<Record<string, StageWorkProgress>>({});

  useEffect(() => {
    const refresh = () => {
      const next: Record<string, StageWorkProgress> = {};
      for (const task of loadWorkBoard().tasks) {
        if (!task.stageId) continue;
        const stage = next[task.stageId] ?? { done: 0, blocked: 0, total: 0 };
        stage.total += 1;
        if (task.status === "done") stage.done += 1;
        if (task.status === "blocked") stage.blocked += 1;
        next[task.stageId] = stage;
      }
      setProgress(next);
    };

    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === WORK_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return progress;
}
