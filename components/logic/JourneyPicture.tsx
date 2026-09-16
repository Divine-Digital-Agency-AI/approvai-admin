"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JourneyLoops } from "./JourneyLoops";
import { boardCard, boardFaint, boardGridEmpty, boardGridFrame, boardMuted, boardTitle } from "@/lib/themed-surfaces";
import { cn } from "@/lib/utils";
import { useWorkStageProgress } from "@/hooks/useWorkStageProgress";
import { PICTURE_LANES, scrollToJourneyStage, shortPictureLine } from "@/lib/logic/picture";
import { stripStageNumber } from "@/lib/logic/stages";
import type { JourneyStage } from "@/lib/logic/types";

interface JourneyPictureProps {
  stages: JourneyStage[];
}

export function JourneyPicture({ stages }: JourneyPictureProps) {
  const [activeId, setActiveId] = useState(stages[0]?.id ?? "");
  const workProgress = useWorkStageProgress();

  const jump = (stageId: string) => {
    setActiveId(stageId);
    scrollToJourneyStage(stageId);
  };

  return (
    <section
      id="picture"
      className={cn("scroll-mt-24 p-6 sm:p-8", boardCard)}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        Journey
      </p>
      <h2 className={cn("mt-1 text-xl font-semibold", boardTitle)}>
        How a contractor gets from login to a packet
      </h2>
      <p className={cn("mt-1 text-sm leading-6", boardMuted)}>
        Left to right. What they do, what ApprovAI does, and who else is involved.
      </p>

      <div className="mt-5 overflow-x-auto">
        <div
          className={cn("grid min-w-[980px]", boardGridFrame)}
          style={{ gridTemplateColumns: `84px repeat(${stages.length}, minmax(118px, 1fr))` }}
        >
          <div className={boardGridEmpty} />
          {stages.map((stage, index) => {
            const progress = workProgress[stage.id];
            return (
            <div
              key={`head-${stage.id}`}
              className={cn(
                "relative flex flex-col items-center px-2 py-2 text-center",
                activeId === stage.id ? "bg-[#1769b8]" : "bg-primary hover:bg-primary-hover"
              )}
            >
              <button type="button" onClick={() => jump(stage.id)} className="w-full">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70">
                  {index + 1}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-white">
                  {stripStageNumber(stage.title)}
                </span>
              </button>
              {progress && (
                <Link
                  href={`/phase-3/now?view=all&stage=${stage.id}`}
                  className="mt-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/25"
                  title={`Open ${stripStageNumber(stage.title)} work`}
                >
                  {progress.done}/{progress.total}
                  {progress.blocked ? ` · ${progress.blocked} blocked` : ""}
                </Link>
              )}
              {index < stages.length - 1 && (
                <ChevronRight className="pointer-events-none absolute -right-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white" />
              )}
            </div>
            );
          })}

          {PICTURE_LANES.map((lane) => (
            <LaneRow
              key={lane.key}
              lane={lane}
              stages={stages}
              activeId={activeId}
              onJump={jump}
            />
          ))}
        </div>
      </div>

      <JourneyLoops stages={stages} onJump={jump} />
    </section>
  );
}

function LaneRow({
  lane,
  stages,
  activeId,
  onJump,
}: {
  lane: (typeof PICTURE_LANES)[number];
  stages: JourneyStage[];
  activeId: string;
  onJump: (stageId: string) => void;
}) {
  return (
    <>
      <div className={cn("flex flex-col justify-center px-3 py-3", lane.tone)}>
        <p className={cn("text-xs font-semibold", boardTitle)}>{lane.label}</p>
        <p className={cn("text-[10px]", boardFaint)}>{lane.hint}</p>
      </div>
      {stages.map((stage) => {
        const text = shortPictureLine(stage[lane.key]);
        const quiet = lane.key === "external" && !text;
        return (
          <button
            key={`${stage.id}-${lane.key}`}
            type="button"
            onClick={() => onJump(stage.id)}
            className={cn(
              "min-h-[88px] px-2.5 py-2.5 text-left",
              lane.tone,
              activeId === stage.id && "ring-1 ring-inset ring-primary/40"
            )}
          >
            {quiet ? (
              <span className="text-xs text-[#c8c8c8] dark:text-[#555]">—</span>
            ) : (
              <span className={cn("line-clamp-4 text-[12px] leading-[1.35]", boardTitle)}>{text || "—"}</span>
            )}
          </button>
        );
      })}
    </>
  );
}
