"use client";

import { useEffect, useState } from "react";
import { DecisionSection } from "./DecisionSection";
import { JourneyPicture } from "./JourneyPicture";
import { ListSection } from "./ListSection";
import { LogicDetails } from "./LogicDetails";
import { LogicToolbar } from "./LogicToolbar";
import { NextActions } from "./NextActions";
import { SummarySection } from "./SummarySection";
import { newId } from "@/lib/logic/ids";
import { useLogicBoard } from "@/hooks/useLogicBoard";
import { cn } from "@/lib/utils";

export function LogicWorkspace() {
  const [present, setPresent] = useState(true);
  const [full, setFull] = useState(false);
  const {
    board,
    ready,
    savedAt,
    now,
    canUndo,
    canRedo,
    update,
    undo,
    redo,
    exportJson,
    addStage,
    removeStage,
    updateStage,
    shiftStage,
    copyStage,
  } = useLogicBoard();

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.classList.add("light");
    return () => {
      root.classList.remove("light");
      if (hadDark) root.classList.add("dark");
    };
  }, []);


  if (!ready) {
    return <div className="min-h-[50vh] bg-[#f7f7f7]" />;
  }

  const locked = board.boardStatus === "locked";
  const readOnly = present || locked;
  const showFull = full && !present;
  const openCount = board.decisions.filter((item) => item.status === "open").length;
  const yesCount = board.decisions.filter((item) => item.status === "yes").length;

  return (
    <div className={cn("logic-board min-h-full bg-[#f7f7f7] text-[#1a1a1a]", present && "logic-present")}>
      <LogicToolbar
        present={present}
        full={showFull}
        locked={locked}
        savedAt={savedAt}
        now={now}
        canUndo={canUndo}
        canRedo={canRedo}
        decisionLabel={`${yesCount} yes · ${openCount} open`}
        onFullChange={setFull}
        onPresentChange={setPresent}
        onUndo={undo}
        onRedo={redo}
        onExport={exportJson}
      />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SummarySection
          title={board.title}
          subtitle={board.subtitle}
          summary={board.summary}
          boardStatus={board.boardStatus}
          present={present}
          locked={locked}
          onTitleChange={(title) => update({ title })}
          onSubtitleChange={(subtitle) => update({ subtitle })}
          onSummaryChange={(summary) => update({ summary })}
          onStatusChange={(boardStatus) => update({ boardStatus })}
          showNotes={showFull}
        />

        <JourneyPicture stages={board.stages} />

        <DecisionSection
          eyebrow={board.decisionsEyebrow}
          title={board.decisionsTitle}
          hint={board.decisionsHint}
          items={board.decisions}
          present={readOnly}
          footer={board.outOfScope}
          onEyebrowChange={(decisionsEyebrow) => update({ decisionsEyebrow })}
          onTitleChange={(decisionsTitle) => update({ decisionsTitle })}
          onHintChange={(decisionsHint) => update({ decisionsHint })}
          onItemChange={(index, value) =>
            update({
              decisions: board.decisions.map((item, i) => (i === index ? { ...item, text: value } : item)),
            })
          }
          onNoteChange={(index, value) =>
            update({
              decisions: board.decisions.map((item, i) => (i === index ? { ...item, note: value } : item)),
            })
          }
          onStatusChange={(index, status) =>
            update({
              decisions: board.decisions.map((item, i) => (i === index ? { ...item, status } : item)),
            })
          }
          onAddItem={() =>
            update({
              decisions: [...board.decisions, { id: newId("d"), text: "", note: "", status: "open" }],
            })
          }
          onRemoveItem={(index) =>
            update({ decisions: board.decisions.filter((_, i) => i !== index) })
          }
          onFooterChange={(outOfScope) => update({ outOfScope })}
        />

        <NextActions openDecisions={openCount} />

        {showFull && (
          <>
            <ListSection
              id="done"
              eyebrow={board.dodEyebrow}
              title={board.dodTitle}
              items={board.dod}
              present={readOnly}
              onEyebrowChange={(dodEyebrow) => update({ dodEyebrow })}
              onTitleChange={(dodTitle) => update({ dodTitle })}
              onItemChange={(index, value) =>
                update({ dod: board.dod.map((item, i) => (i === index ? value : item)) })
              }
              onAddItem={() => update({ dod: [...board.dod, ""] })}
              onRemoveItem={(index) => update({ dod: board.dod.filter((_, i) => i !== index) })}
            />
            <LogicDetails
              board={board}
              readOnly={readOnly}
              onUpdate={update}
              onStageTitleChange={(stageId, title) => updateStage(stageId, { title })}
              onCellChange={(stageId, lane, value) => updateStage(stageId, { [lane]: value })}
              onAddStage={addStage}
              onRemoveStage={removeStage}
              onMoveStage={shiftStage}
              onDuplicateStage={copyStage}
            />
          </>
        )}
      </div>
    </div>
  );
}
