import assert from "node:assert/strict";
import { test } from "node:test";
import { jobStage, matchesSearch } from "./job-stage.ts";

const NOW = Date.parse("2026-10-24T12:00:00Z");
const base = { intake: {}, blueprint: null, lastActivity: "2026-10-24T10:00:00Z", applicationPrepared: false, now: NOW };

test("where a job stands, in plain words, from what the app already saved", () => {
  assert.equal(jobStage({ ...base, lastActivity: null }).label, "Not started with Ant");
  assert.equal(jobStage({ ...base, intake: { ant_progress: { contractor: "needed" } } }).label, "Needs a contractor");
  assert.equal(jobStage({ ...base, intake: { ant_progress: { plans: "waiting" } } }).label, "Waiting for plans");
  assert.equal(jobStage({ ...base, blueprint: { status: "uploaded", updated_at: "2026-10-24T11:00:00Z" } }).label,
    "Plans uploaded, not reviewed");
  assert.equal(jobStage({ ...base, blueprint: { status: "processed", updated_at: "2026-10-24T11:00:00Z" } }).label, "Plans reviewed");
  assert.equal(jobStage({ ...base, applicationPrepared: true }).label, "Application prepared");
  const applied = jobStage({ ...base, applicationPrepared: true,
    intake: { ant_next_steps: { steps: [{ key: "submit", done: true }] } } });
  assert.equal(applied.label, "Applied");
});

test("a Plan Review that has not moved for 30 minutes is called stuck, with since when", () => {
  const stuck = jobStage({ ...base, blueprint: { status: "extracting", updated_at: "2026-07-09T10:00:00Z" } });
  assert.equal(stuck.label, "Plan Review stuck");
  assert.equal(stuck.tone, "bad");
  const running = jobStage({ ...base, blueprint: { status: "classifying", updated_at: "2026-10-24T11:50:00Z" } });
  assert.equal(running.label, "Plan Review running");
});

test("a job nobody has touched for a week says how long, unless they already applied", () => {
  const quiet = jobStage({ ...base, lastActivity: "2026-10-10T12:00:00Z" });
  assert.equal(quiet.quietDays, 14);
  assert.match(quiet.why, /Quiet for 14 days\./);
  const applied = jobStage({ ...base, lastActivity: "2026-10-10T12:00:00Z",
    intake: { ant_next_steps: { steps: [{ key: "submit", done: true }] } } });
  assert.equal(applied.quietDays, null);
});

test("search finds a job by the person's own name too", () => {
  const job = { name: "Fence", address: "1 Main St", client_name: null,
    profiles: { email: "pat@example.com", first_name: "Pat", last_name: "Rivera" } };
  assert.ok(matchesSearch(job, "rivera"));
  assert.ok(matchesSearch(job, "pat rivera"));
  assert.ok(matchesSearch(job, "main st"));
  assert.ok(!matchesSearch(job, "jones"));
});

test("the dashboard counts where jobs stand, in plain words", async () => {
  const { summarizeJobs } = await import("./job-stage.ts");
  const jobs = [
    { stage: jobStage({ ...base, lastActivity: "2026-10-23T10:00:00Z" }), lastActivity: "2026-10-23T10:00:00Z" },
    { stage: jobStage({ ...base, lastActivity: "2026-10-01T10:00:00Z" }), lastActivity: "2026-10-01T10:00:00Z" },
    { stage: jobStage({ ...base, blueprint: { status: "extracting", updated_at: "2026-07-09T10:00:00Z" } }), lastActivity: base.lastActivity },
    { stage: jobStage({ ...base, applicationPrepared: true }), lastActivity: base.lastActivity },
    { stage: jobStage({ ...base, intake: { ant_next_steps: { steps: [{ key: "submit", done: true }] } } }), lastActivity: null },
  ];
  assert.deepEqual(summarizeJobs(jobs, NOW), { activeThisWeek: 3, quiet: 1, stuck: 1, prepared: 1, applied: 1 });
});
