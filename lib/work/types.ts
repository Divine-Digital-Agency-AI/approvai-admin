export type WorkStatus = "open" | "doing" | "blocked" | "done";
export type WorkOwner = "us" | "brian" | "waiting";
export type WorkKind = "decision" | "build" | "dependency" | "acceptance" | "guardrail";
export type WorkPriority = "p0" | "p1" | "p2";
export type WorkMilestone = "align" | "build" | "verify" | "release";

export interface WorkTask {
  id: string;
  group: string;
  stageId: string;
  title: string;
  detail: string;
  kind: WorkKind;
  priority: WorkPriority;
  milestone: WorkMilestone;
  assignee: string;
  acceptance: string;
  evidence: string;
  source: string;
  dependsOn: string[];
  notes: string;
  status: WorkStatus;
  owner: WorkOwner;
}

export interface WorkBoard {
  id: string;
  version: number;
  title: string;
  subtitle: string;
  tasks: WorkTask[];
  updatedAt: string;
}
