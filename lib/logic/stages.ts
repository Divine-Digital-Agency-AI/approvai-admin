import { newId } from "./ids";
import type { JourneyStage } from "./types";

export function stripStageNumber(title: string): string {
  return title.replace(/^\d+\s*/, "").trim() || "Stage";
}

export function renumberStages(stages: JourneyStage[]): JourneyStage[] {
  return stages.map((stage, index) => ({
    ...stage,
    title: `${index + 1} ${stripStageNumber(stage.title)}`,
  }));
}

export function moveStage(stages: JourneyStage[], stageId: string, delta: -1 | 1): JourneyStage[] {
  const index = stages.findIndex((stage) => stage.id === stageId);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= stages.length) return stages;
  const copy = [...stages];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return renumberStages(copy);
}

export function duplicateStage(stages: JourneyStage[], stageId: string): JourneyStage[] {
  const index = stages.findIndex((stage) => stage.id === stageId);
  if (index < 0) return stages;
  const copy = [...stages];
  copy.splice(index + 1, 0, { ...stages[index], id: newId("stage") });
  return renumberStages(copy);
}
