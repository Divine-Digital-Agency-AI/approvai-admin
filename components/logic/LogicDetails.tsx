"use client";

import { CompareSection } from "./CompareSection";
import { JourneyGrid } from "./JourneyGrid";
import { ListSection } from "./ListSection";
import { ScopeSection } from "./ScopeSection";
import type { LogicBoard } from "@/lib/logic/types";

interface LogicDetailsProps {
  board: LogicBoard;
  readOnly: boolean;
  onUpdate: (patch: Partial<LogicBoard>) => void;
  onStageTitleChange: (stageId: string, title: string) => void;
  onCellChange: (stageId: string, lane: "customer" | "system" | "external", value: string) => void;
  onAddStage: () => void;
  onRemoveStage: (stageId: string) => void;
  onMoveStage: (stageId: string, delta: -1 | 1) => void;
  onDuplicateStage: (stageId: string) => void;
}

export function LogicDetails({
  board,
  readOnly,
  onUpdate,
  onStageTitleChange,
  onCellChange,
  onAddStage,
  onRemoveStage,
  onMoveStage,
  onDuplicateStage,
}: LogicDetailsProps) {
  return (
    <>
      <CompareSection
        eyebrow={board.compareEyebrow}
        title={board.compareTitle}
        columns={board.compare}
        present={readOnly}
        onEyebrowChange={(compareEyebrow) => onUpdate({ compareEyebrow })}
        onTitleChange={(compareTitle) => onUpdate({ compareTitle })}
        onColumnTitleChange={(columnId, title) =>
          onUpdate({
            compare: board.compare.map((column) => (column.id === columnId ? { ...column, title } : column)),
          })
        }
        onItemChange={(columnId, index, value) =>
          onUpdate({
            compare: board.compare.map((column) =>
              column.id === columnId
                ? { ...column, items: column.items.map((item, i) => (i === index ? value : item)) }
                : column
            ),
          })
        }
        onAddItem={(columnId) =>
          onUpdate({
            compare: board.compare.map((column) =>
              column.id === columnId ? { ...column, items: [...column.items, ""] } : column
            ),
          })
        }
        onRemoveItem={(columnId, index) =>
          onUpdate({
            compare: board.compare.map((column) =>
              column.id === columnId
                ? { ...column, items: column.items.filter((_, i) => i !== index) }
                : column
            ),
          })
        }
      />

      <JourneyGrid
        eyebrow={board.journeyEyebrow}
        title={board.journeyTitle}
        hint={board.journeyHint}
        stages={board.stages}
        present={readOnly}
        onEyebrowChange={(journeyEyebrow) => onUpdate({ journeyEyebrow })}
        onTitleChange={(journeyTitle) => onUpdate({ journeyTitle })}
        onHintChange={(journeyHint) => onUpdate({ journeyHint })}
        onStageTitleChange={onStageTitleChange}
        onCellChange={onCellChange}
        onAddStage={onAddStage}
        onRemoveStage={onRemoveStage}
        onMoveStage={onMoveStage}
        onDuplicateStage={onDuplicateStage}
      />

      <ListSection
        id="logic"
        eyebrow={board.gatesEyebrow}
        title={board.gatesTitle}
        items={board.gates}
        present={readOnly}
        onEyebrowChange={(gatesEyebrow) => onUpdate({ gatesEyebrow })}
        onTitleChange={(gatesTitle) => onUpdate({ gatesTitle })}
        onItemChange={(index, value) =>
          onUpdate({ gates: board.gates.map((item, i) => (i === index ? value : item)) })
        }
        onAddItem={() => onUpdate({ gates: [...board.gates, ""] })}
        onRemoveItem={(index) => onUpdate({ gates: board.gates.filter((_, i) => i !== index) })}
      />

      <ScopeSection
        inScope={board.inScope}
        phase4={board.phase4}
        assumptions={board.assumptions}
        present={readOnly}
        onInScopeChange={(index, value) =>
          onUpdate({ inScope: board.inScope.map((item, i) => (i === index ? value : item)) })
        }
        onAddInScope={() => onUpdate({ inScope: [...board.inScope, ""] })}
        onRemoveInScope={(index) => onUpdate({ inScope: board.inScope.filter((_, i) => i !== index) })}
        onPhase4Change={(index, value) =>
          onUpdate({ phase4: board.phase4.map((item, i) => (i === index ? value : item)) })
        }
        onAddPhase4={() => onUpdate({ phase4: [...board.phase4, ""] })}
        onRemovePhase4={(index) => onUpdate({ phase4: board.phase4.filter((_, i) => i !== index) })}
        onAssumptionChange={(index, value) =>
          onUpdate({ assumptions: board.assumptions.map((item, i) => (i === index ? value : item)) })
        }
        onAddAssumption={() => onUpdate({ assumptions: [...board.assumptions, ""] })}
        onRemoveAssumption={(index) =>
          onUpdate({ assumptions: board.assumptions.filter((_, i) => i !== index) })
        }
      />
    </>
  );
}
