"use client";

import { RotateCcw } from "lucide-react";
import { JOURNEY_LOOPS, loopStageId } from "@/lib/logic/picture";
import type { JourneyStage } from "@/lib/logic/types";

interface JourneyLoopsProps {
  stages: JourneyStage[];
  onJump: (stageId: string) => void;
}

export function JourneyLoops({ stages, onJump }: JourneyLoopsProps) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#888]">Loops</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {JOURNEY_LOOPS.map((loop) => (
          <button
            key={loop.id}
            type="button"
            onClick={() => onJump(loopStageId(stages, loop.stageId))}
            className="rounded-xl border border-[#e4e4e4] bg-[#f7f7f7] px-3 py-3 text-left hover:border-primary/40 hover:bg-[#edf5fc]"
          >
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <RotateCcw className="h-3 w-3" />
              {loop.label}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#5c5c5c]">{loop.path}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
