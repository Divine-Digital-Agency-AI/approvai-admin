/**
 * Where a job stands, in plain words, from what the app already saves (24 Oct 2026). Before this, the admin list only
 * showed the old pipeline status (created / processing / ready / completed), which says nothing about how far the person
 * got with Ant or where they are stuck. Pure, so it can be tested without a database.
 */

export type StageTone = "good" | "wait" | "bad" | "muted";

export interface StageInput {
  intake: unknown;
  blueprint: { status: string; updated_at?: string | null } | null;
  /** The person's or Ant's newest message on this job, or null when the job has no Ant chat. */
  lastActivity: string | null;
  /** Ant prepared the application in the chat at least once. */
  applicationPrepared: boolean;
  now?: number;
}

export interface Stage {
  label: string;
  why: string;
  tone: StageTone;
  /** Days since anything happened, when it is a week or more and they have not applied; otherwise null. */
  quietDays: number | null;
}

const DAY = 24 * 60 * 60 * 1000;
const STALLED_AFTER = 30 * 60 * 1000;
const QUIET_AFTER_DAYS = 7;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function shortDate(iso: string): string {
  const when = new Date(iso);
  return Number.isNaN(when.getTime()) ? iso : when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function jobStage(input: StageInput): Stage {
  const now = input.now ?? Date.now();
  const intake = record(input.intake);
  const progress = record(intake.ant_progress);
  const steps = Array.isArray(record(intake.ant_next_steps).steps) ? (record(intake.ant_next_steps).steps as unknown[]) : [];
  const applied = steps.some((s) => record(s).key === "submit" && record(s).done === true);

  let label: string;
  let why: string;
  let tone: StageTone;
  const bp = input.blueprint;
  const bpChanged = bp?.updated_at ? Date.parse(bp.updated_at) : NaN;

  if (applied) {
    [label, why, tone] = ["Applied", "They told Ant they applied with the city.", "good"];
  } else if (input.applicationPrepared) {
    [label, why, tone] = ["Application prepared", "Ant prepared the application; they have not said they applied.", "good"];
  } else if (bp && (bp.status === "classifying" || bp.status === "extracting")) {
    if (!Number.isNaN(bpChanged) && now - bpChanged > STALLED_AFTER) {
      [label, why, tone] = ["Plan Review stuck", `It has not moved since ${shortDate(bp.updated_at as string)}.`, "bad"];
    } else {
      [label, why, tone] = ["Plan Review running", "Their plans are being reviewed now.", "wait"];
    }
  } else if (bp?.status === "error") {
    [label, why, tone] = ["Plan Review failed", "The review did not finish; they can add the plans again.", "bad"];
  } else if (bp?.status === "processed") {
    [label, why, tone] = ["Plans reviewed", "Next for them: where to apply and the application.", "wait"];
  } else if (bp?.status === "uploaded") {
    [label, why, tone] = ["Plans uploaded, not reviewed", "They added plans but did not run Plan Review.", "wait"];
  } else if (progress.plans === "waiting") {
    [label, why, tone] = ["Waiting for plans", "They told Ant they don't have plans yet.", "wait"];
  } else if (progress.contractor === "needed") {
    [label, why, tone] = ["Needs a contractor", "They told Ant they still need a licensed contractor.", "wait"];
  } else if (!input.lastActivity) {
    [label, why, tone] = ["Not started with Ant", "No chat with Ant on this job yet.", "muted"];
  } else {
    [label, why, tone] = ["Setting up", "Getting the job details together with Ant.", "wait"];
  }

  const last = input.lastActivity ? Date.parse(input.lastActivity) : NaN;
  const days = Number.isNaN(last) ? null : Math.floor((now - last) / DAY);
  const quietDays = !applied && days !== null && days >= QUIET_AFTER_DAYS ? days : null;
  if (quietDays !== null) why = `${why} Quiet for ${quietDays} days.`;
  return { label, why, tone, quietDays };
}

export interface SearchableJob {
  name: string;
  address: string | null;
  client_name: string | null;
  profiles?: { email: string | null; first_name: string | null; last_name: string | null } | null;
}

/** Search by job name, address, client, email or the person's own name (it was not searchable before). */
export function matchesSearch(job: SearchableJob, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const person = [job.profiles?.first_name, job.profiles?.last_name].filter(Boolean).join(" ");
  return [job.name, job.address, job.client_name, job.profiles?.email, person]
    .some((field) => (field || "").toLowerCase().includes(q));
}
