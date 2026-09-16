import type { JourneyStage } from "./types";

export const PICTURE_LANES = [
  { key: "customer" as const, label: "Contractor", hint: "what they do", tone: "bg-white dark:bg-[#1a1a1a]" },
  { key: "system" as const, label: "ApprovAI", hint: "what we do", tone: "bg-[#edf5fc] dark:bg-[#152433]" },
  { key: "external" as const, label: "Someone else", hint: "who else is involved", tone: "bg-[#fff4ec] dark:bg-[#2a1f18]" },
];

export const JOURNEY_LOOPS = [
  {
    id: "missing",
    stageId: "gather",
    label: "Something missing",
    path: "Chat says what it is and where to get it.",
  },
  {
    id: "fail",
    stageId: "review",
    label: "Review fails",
    path: "10-bullet letter → new set → review again.",
  },
  {
    id: "sign",
    stageId: "approvals",
    label: "Needs sign / notary",
    path: "Send → notify → nudge → file returns.",
  },
];

export function shortPictureLine(value: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const sentence = trimmed.split(/(?<=[.?!]["”']?)\s+/)[0] ?? trimmed;
  return sentence.length > 88 ? `${sentence.slice(0, 85).trim()}…` : sentence;
}

export function scrollToJourneyStage(stageId: string) {
  document.getElementById("journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    document
      .querySelector<HTMLElement>(`[data-stage="${stageId}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, 180);
}

export function loopStageId(stages: JourneyStage[], preferredId: string): string {
  if (stages.some((stage) => stage.id === preferredId)) return preferredId;
  return stages[0]?.id ?? preferredId;
}
