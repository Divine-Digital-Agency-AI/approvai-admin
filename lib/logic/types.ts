export interface JourneyStage {
  id: string;
  title: string;
  customer: string;
  system: string;
  external: string;
}

export interface CompareColumn {
  id: string;
  title: string;
  proposed?: boolean;
  items: string[];
}

export type DecisionStatus = "open" | "yes" | "no";
export type BoardStatus = "draft" | "ready" | "locked";

export interface DecisionItem {
  id: string;
  text: string;
  note?: string;
  status: DecisionStatus;
}

export interface LogicBoard {
  id: string;
  version: number;
  title: string;
  subtitle: string;
  boardStatus: BoardStatus;
  summary: string;
  inScope: string[];
  phase4: string[];
  assumptions: string[];
  compareEyebrow: string;
  compareTitle: string;
  compare: CompareColumn[];
  journeyEyebrow: string;
  journeyTitle: string;
  journeyHint: string;
  stages: JourneyStage[];
  gatesEyebrow: string;
  gatesTitle: string;
  gates: string[];
  decisionsEyebrow: string;
  decisionsTitle: string;
  decisionsHint: string;
  decisions: DecisionItem[];
  outOfScope: string;
  dodEyebrow: string;
  dodTitle: string;
  dod: string[];
  updatedAt: string;
}
