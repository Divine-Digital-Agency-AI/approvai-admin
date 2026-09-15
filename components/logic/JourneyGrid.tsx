"use client";

import { ChevronLeft, ChevronRight, Copy, Plus, X } from "lucide-react";
import { useRef } from "react";
import { EditableField } from "./EditableField";
import type { JourneyStage } from "@/lib/logic/types";

const LANES = [
  { key: "customer" as const, label: "Contractor", hint: "action", tone: "bg-white" },
  { key: "system" as const, label: "System", hint: "action", tone: "bg-[#edf5fc]" },
  { key: "external" as const, label: "External", hint: "owner", tone: "bg-[#fff4ec]" },
];

interface JourneyGridProps {
  eyebrow: string;
  title: string;
  hint: string;
  stages: JourneyStage[];
  present: boolean;
  onEyebrowChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onHintChange: (value: string) => void;
  onStageTitleChange: (stageId: string, value: string) => void;
  onCellChange: (stageId: string, lane: "customer" | "system" | "external", value: string) => void;
  onAddStage: () => void;
  onRemoveStage: (stageId: string) => void;
  onMoveStage: (stageId: string, delta: -1 | 1) => void;
  onDuplicateStage: (stageId: string) => void;
}

export function JourneyGrid({
  eyebrow,
  title,
  hint,
  stages,
  present,
  onEyebrowChange,
  onTitleChange,
  onHintChange,
  onStageTitleChange,
  onCellChange,
  onAddStage,
  onRemoveStage,
  onMoveStage,
  onDuplicateStage,
}: JourneyGridProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: -1 | 1) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(280, node.clientWidth * 0.7), behavior: "smooth" });
  };

  const scrollToStage = (stageId: string) => {
    const cell = scrollerRef.current?.querySelector<HTMLElement>(`[data-stage="${stageId}"]`);
    cell?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section
      id="journey"
      className="scroll-mt-24 rounded-2xl border border-[#e4e4e4] bg-white p-6 sm:p-8"
    >
      <EditableField
        value={eyebrow}
        onChange={onEyebrowChange}
        present={present}
        rows={1}
        className="text-xs font-semibold uppercase tracking-[0.08em] text-primary"
      />
      <EditableField
        value={title}
        onChange={onTitleChange}
        present={present}
        rows={1}
        className="mt-1 text-xl font-semibold text-[#1a1a1a]"
      />
      <EditableField
        value={hint}
        onChange={onHintChange}
        present={present}
        rows={1}
        muted
        className="mt-1 text-sm"
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          className="print:hidden rounded-full border border-[#e4e4e4] p-1.5 text-[#1a1a1a] hover:bg-[#f7f7f7]"
          aria-label="Scroll stages left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => scrollToStage(stage.id)}
            className="rounded-full bg-[#edf5fc] px-3 py-1 text-xs font-medium text-primary hover:bg-[#d8ebfa]"
          >
            {stage.title || "Stage"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          className="print:hidden rounded-full border border-[#e4e4e4] p-1.5 text-[#1a1a1a] hover:bg-[#f7f7f7]"
          aria-label="Scroll stages right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollerRef} className="mt-4 overflow-x-auto">
        <div
          className="grid min-w-[1100px] gap-px rounded-xl border border-[#e4e4e4] bg-[#e4e4e4]"
          style={{ gridTemplateColumns: `140px repeat(${stages.length}, minmax(170px, 1fr))` }}
        >
          <div className="bg-[#f7f7f7] p-3" />
          {stages.map((stage, index) => (
            <div key={stage.id} data-stage={stage.id} className="relative bg-primary px-3 py-3">
              <EditableField
                value={stage.title}
                onChange={(value) => onStageTitleChange(stage.id, value)}
                present={present}
                rows={1}
                className="text-center text-sm font-semibold text-white placeholder:text-white/50"
              />
              {!present && (
                <div className="mt-1 flex justify-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMoveStage(stage.id, -1)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-white/80 hover:bg-white/15 disabled:opacity-30"
                    aria-label={`Move ${stage.title} left`}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateStage(stage.id)}
                    className="rounded p-0.5 text-white/80 hover:bg-white/15"
                    aria-label={`Duplicate ${stage.title}`}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveStage(stage.id)}
                      className="rounded p-0.5 text-white/80 hover:bg-white/15"
                      aria-label={`Remove ${stage.title}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onMoveStage(stage.id, 1)}
                    disabled={index === stages.length - 1}
                    className="rounded p-0.5 text-white/80 hover:bg-white/15 disabled:opacity-30"
                    aria-label={`Move ${stage.title} right`}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {LANES.map((lane) => (
            <LaneRow key={lane.key} lane={lane} stages={stages} present={present} onCellChange={onCellChange} />
          ))}
        </div>
      </div>

      {!present && (
        <button
          type="button"
          onClick={onAddStage}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Add stage
        </button>
      )}
    </section>
  );
}

function LaneRow({
  lane,
  stages,
  present,
  onCellChange,
}: {
  lane: (typeof LANES)[number];
  stages: JourneyStage[];
  present: boolean;
  onCellChange: JourneyGridProps["onCellChange"];
}) {
  return (
    <>
      <div className={`${lane.tone} flex flex-col justify-center px-4 py-5`}>
        <p className="text-sm font-semibold text-[#1a1a1a]">{lane.label}</p>
        <p className="text-xs text-[#5c5c5c]">{lane.hint}</p>
      </div>
      {stages.map((stage) => (
        <div key={`${stage.id}-${lane.key}`} className={`${lane.tone} min-h-[140px] p-3`}>
          <EditableField
            value={stage[lane.key]}
            onChange={(value) => onCellChange(stage.id, lane.key, value)}
            present={present}
            rows={5}
            className="text-[13px] leading-5 text-[#1a1a1a]"
          />
        </div>
      ))}
    </>
  );
}
