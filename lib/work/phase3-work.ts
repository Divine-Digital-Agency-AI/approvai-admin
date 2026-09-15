import type {
  WorkBoard,
  WorkKind,
  WorkMilestone,
  WorkOwner,
  WorkTask,
} from "./types";

export const WORK_SEED_VERSION = 14;

const BRIAN_SOURCE = "Brian Sodre · Sept 1, 2026 walkthrough";
const STAGE_BY_GROUP: Record<string, string> = {
  Start: "start",
  Discover: "discover",
  Identify: "identify",
  Gather: "gather",
  Prefill: "prefill",
  Review: "review",
  Approvals: "approvals",
  Ready: "ready",
};

const SLICE_BY_GROUP: Record<string, string> = {
  Start: "1 · Find project and start chat",
  Discover: "1 · Find project and start chat",
  Identify: "2 · Identify requirements",
  Gather: "2 · Identify requirements",
  Prefill: "3 · Prefill documents",
  Review: "4 · Review like Brian",
  Approvals: "5 · Signature and tracking",
  Ready: "6 · Complete packet",
};

const DONE_SLICE_BY_ID: Record<string, string> = {
  "dod-login-start": "1 · Find project and start chat",
  "dod-missing": "2 · Identify requirements",
  "dod-identify-prefill": "4 · Review like Brian",
  "dod-sign-folder": "5 · Signature and tracking",
  "dod-stranger": "6 · Complete packet",
};

function deliveryGroup(id: string, group: string): string {
  if (group === "Align") return "Brian sign-off";
  if (group === "Phase 2 proof") return group;
  if (group === "Done when") return DONE_SLICE_BY_ID[id] ?? "Release criteria";
  return SLICE_BY_GROUP[group] ?? "Release criteria";
}

function taskKind(group: string, owner: WorkOwner): WorkKind {
  if (group === "Align") return "decision";
  if (group === "Done when") return "acceptance";
  if (group === "Guardrails" || group === "Brian's bar") return "guardrail";
  if (owner === "waiting") return "dependency";
  return "build";
}

function taskMilestone(group: string): WorkMilestone {
  if (group === "Align") return "align";
  if (group === "Done when") return "verify";
  if (group === "Guardrails") return "release";
  return "build";
}

function defaultAcceptance(title: string, detail: string, kind: WorkKind): string {
  if (kind === "decision") return "Brian answers Yes, or records the exact change required.";
  if (kind === "acceptance") return detail;
  if (kind === "guardrail") return `The demonstrated flow satisfies: ${title}.`;
  if (kind === "dependency") return `${title} returns to ApprovAI and the job can continue.`;
  return `Demonstrate “${title}” end to end on one Cape Coral screen-enclosure job.`;
}

function task(
  id: string,
  group: string,
  title: string,
  detail: string,
  extras?: Partial<
    Pick<
      WorkTask,
      | "status"
      | "owner"
      | "kind"
      | "priority"
      | "milestone"
      | "stageId"
      | "assignee"
      | "acceptance"
      | "evidence"
      | "source"
      | "dependsOn"
    >
  >
): WorkTask {
  const owner = extras?.owner ?? "us";
  const kind = extras?.kind ?? taskKind(group, owner);
  const stageId = extras?.stageId ?? STAGE_BY_GROUP[group] ?? "";
  return {
    id,
    group: deliveryGroup(id, group),
    stageId,
    title,
    detail,
    kind,
    priority: extras?.priority ?? (kind === "decision" || kind === "acceptance" ? "p0" : "p1"),
    milestone: extras?.milestone ?? taskMilestone(group),
    assignee: extras?.assignee ?? (owner === "brian" ? "Brian" : owner === "waiting" ? "External" : ""),
    acceptance: extras?.acceptance ?? defaultAcceptance(title, detail, kind),
    evidence: extras?.evidence ?? "",
    source: extras?.source ?? BRIAN_SOURCE,
    dependsOn: extras?.dependsOn ?? [],
    notes: "",
    status: extras?.status ?? "open",
    owner,
  };
}

function phase2Proof(id: string, title: string, acceptance: string, stageId = ""): WorkTask {
  return task(id, "Phase 2 proof", title, "Must remain working while Phase 3 repackages the experience.", {
    stageId,
    kind: "acceptance",
    priority: "p0",
    milestone: "verify",
    assignee: "Internal",
    acceptance,
    evidence: "August 18 acceptance record · MVP Acceptance — Apple Snail",
    source: "August 18, 2026 acceptance test record",
    status: "done",
  });
}

const brian = { owner: "brian" as WorkOwner };
const waiting = { owner: "waiting" as WorkOwner };

export function createPhase3Work(): WorkBoard {
  return {
    id: "phase-3-work",
    version: WORK_SEED_VERSION,
    title: "Cape Coral screen enclosure",
    subtitle: "Current work, items requiring your input, and the next review.",
    tasks: [
      // D · Decisions
      task("align-board", "Align", "Confirm the Phase 3 journey", "Chat-first. Forms stay as a power-user canvas.", brian),
      task("align-questions", "Align", "Confirm the 3 start questions", "Pool or lanai, size, slab. Enough to start?", brian),
      task("align-docs", "Align", "Confirm the required doc list", "Site plan, structural, NOC, owl. Hide impervious if no slab.", brian),
      task("align-review", "Align", "Confirm short review", "Pass/fail plus about ten clear items for the engineer when needed.", brian),
      task("align-notary", "Align", "Confirm notary path", "Send to Proof.com or print. We notify. We do not buy a seat.", brian),
      task(
        "align-dod",
        "Align",
        "Confirm Phase 3 done",
        "A first-time contractor can finish one Cape Coral screen enclosure without permit expertise.",
        brian
      ),

      // Brian's words · product quality bar
      task(
        "bar-functional",
        "Brian's bar",
        "The first complete customer journey is ready to review",
        "A real user completes the full workflow in the product.",
        { kind: "acceptance", milestone: "release", priority: "p0" }
      ),
      task(
        "bar-idiot",
        "Brian's bar",
        "A first-time contractor can complete this without training",
        "A first-time contractor finishes without knowing permitting terminology.",
        { kind: "acceptance", milestone: "verify", priority: "p0" }
      ),
      task(
        "bar-resistance",
        "Brian's bar",
        "Use the least path of resistance",
        "Ask for the smallest customer input; gather public information behind the scenes.",
        { priority: "p0" }
      ),
      task(
        "bar-brian",
        "Brian's bar",
        "The customer feels like they are talking to Brian",
        "Prompt the right simple questions, organize the answer, and handle the work behind the scenes.",
        { priority: "p0" }
      ),
      task(
        "bar-chat-only",
        "Brian's bar",
        "The customer mainly sees the chat",
        "Technical fields stay hidden unless a final verification view or power-user canvas is useful.",
        { stageId: "start", priority: "p0" }
      ),
      task(
        "bar-simple",
        "Brian's bar",
        "Progress, action steps, and problems stay simple",
        "No 10-page customer report. Show what happened, what is next, and what is wrong.",
        { priority: "p0" }
      ),
      task(
        "bar-potato",
        "Brian's bar",
        "Always show who has the hot potato",
        "Every waiting step says whose responsibility is next and what action gets the job moving.",
        { stageId: "approvals", priority: "p0" }
      ),
      task(
        "bar-prefill",
        "Brian's bar",
        "Prefilling is the biggest timesaver",
        "Use customer, profile, parcel, and plan data so contractors do not retype documents.",
        { stageId: "prefill", priority: "p0" }
      ),
      task(
        "bar-communication",
        "Brian's bar",
        "Ask Brian before developing assumptions",
        "Direct questions are better than building a batch from an interpretation.",
        { kind: "guardrail", milestone: "align", priority: "p1" }
      ),

      // 1 Start
      task("start-login", "Start", "Contractor can log in", "Same account. No new onboarding for Phase 3."),
      task("start-find", "Start", "Home shows 50+ jobs", "Find an existing project without hunting."),
      task("start-search", "Start", "Search and status are obvious", "Status is visible on the list. Search works at 50+ jobs."),
      task("start-new", "Start", "New job opens a thread", "Not the 6-step wizard. Chat starts the job."),
      task("start-chat", "Start", "Chat is the main path", "The thread runs Identify → Prefill → Review."),
      task("start-canvas", "Start", "Forms stay as a canvas", "Power-user forms stay linked to the thread. They do not run the job."),

      // 2 Discover
      task("discover-address", "Discover", "Address in chat", "Customer gives the job address in the thread."),
      task("discover-intent", "Discover", "Intent in chat", "“Pool screen enclosure” or equal. System hears the permit type."),
      task("discover-q-type", "Discover", "Question 1: pool or lanai", "First of the 3 Brian questions."),
      task("discover-q-size", "Discover", "Question 2: size", "Second of the 3 Brian questions."),
      task("discover-q-slab", "Discover", "Question 3: slab", "New slab or no. Drives the impervious row."),
      task("discover-parcel", "Discover", "Lee County parcel lookup", "Owner, zoning, lot from public records."),
      task("discover-owner", "Discover", "Show parcel owner", "Surface the owner on the thread, not a hidden field."),
      task("discover-zoning", "Discover", "Show zoning and lot", "Enough for Brian’s review later."),
      task("discover-wip", "Discover", "Show work in progress", "Lookup is visible while it runs. No silent wait."),
      task("discover-records", "Discover", "Public records path", "Lee County / Cape Coral. Confirm if lookup fails.", waiting),

      // 3 Identify
      task("identify-type", "Identify", "Customer confirms permit type", "Screen enclosure, Cape Coral. No extra types."),
      task("identify-list", "Identify", "Customer confirms the short list", "Only the documents that apply."),
      task("identify-build", "Identify", "System builds the required list", "From intent, questions, and municipality."),
      task("identify-hide", "Identify", "Hide leftover documents", "No Phase 2 leftover checklist rows."),
      task("identify-noc", "Identify", "Always include NOC", "Every Cape Coral screen enclosure."),
      task("identify-owl", "Identify", "Cape Coral owl", "Show owl for this city. Hide it elsewhere later."),
      task("identify-impervious", "Identify", "Hide impervious if no slab", "Question 3 determines whether this item is included."),
      task("identify-unsure", "Identify", "If unsure, ask", "Never invent a requirement. Confirm with the customer."),

      // 4 Gather
      task("gather-upload", "Gather", "Customer uploads plans", "Site plan / structural / missing items on the thread."),
      task("gather-where", "Gather", "“Where do I get this?”", "Chat answers with a source, not a dead checklist row."),
      task("gather-read", "Gather", "Read plans first when they exist", "Analyze before asking again for the same file."),
      task("gather-explain", "Gather", "Explain each missing item", "What it is, why it is needed, where to get it."),
      task("gather-engineer", "Gather", "Engineer only if a new set is required", "Later loop. Not a first-pass default.", waiting),

      // 5 Prefill
      task("prefill-noc", "Prefill", "Prefill NOC", "From chat, parcel, and plans."),
      task("prefill-owl", "Prefill", "Prefill owl", "From chat, parcel, and plans."),
      task("prefill-fdcd", "Prefill", "Prefill F_DCD_1003", "From chat, parcel, and plans."),
      task("prefill-review", "Prefill", "Customer reviews prefilled forms", "On the thread or the linked canvas."),
      task("prefill-correct", "Prefill", "Customer confirms or corrects", "Edits write back. Do not silently overwrite."),

      // 6 Review
      task("review-passfail", "Review", "Show pass / fail", "Customer does not read a long report."),
      task("review-label", "Review", "Check the label", "Brian’s first check."),
      task("review-setbacks", "Review", "Check the four setbacks", "Brian’s remaining checks."),
      task("review-bullets", "Review", "Write ~10 engineer bullets if it fails", "Short comment list. Not a customer essay."),
      task("review-send", "Review", "Engineer receives the short list", "The letter goes to the engineer, not a long PDF.", waiting),
      task("review-loop", "Review", "Wait for a new set, then review again", "Fail → letter → new set → review. Repeat until pass.", waiting),

      // 7 Approvals
      task("approvals-send", "Approvals", "Send docs to owner / signer", "Customer starts it from the thread."),
      task("approvals-track", "Approvals", "Track who has the ball", "Owner / signer / notary is visible."),
      task("approvals-route", "Approvals", "Route the signature", "System sends. Customer does not chase a PDF by hand."),
      task("approvals-notary", "Approvals", "Send notary link if needed", "Proof.com or print."),
      task("approvals-notify", "Approvals", "Notify. Do not buy a seat", "We send and watch. We do not purchase Proof.com."),
      task("approvals-nudge", "Approvals", "Nudge until the file returns", "Keep status honest while it is out."),
      task("approvals-return", "Approvals", "Signed file returns to the folder", "Back on the job. Ready can proceed."),

      // 8 Ready
      task("ready-confirm", "Ready", "Human confirms the packet", "A person says it is complete before Ready."),
      task("ready-folder", "Ready", "One folder per job", "Everything in one place. No scatter."),
      task("ready-zip", "Ready", "ZIP packet download", "Customer can take the packet."),
      task("ready-file", "Ready", "Customer files with the city", "Manual. Not auto-submit. Phase 4."),
      task("ready-meaning", "Ready", "Ready is not city-approved", "Packet complete. City decision is later."),

      // C · Gates
      task("gate-new-existing", "Gates", "New vs existing project", "Search or start a thread. Do not fork the job."),
      task("gate-address-fail", "Gates", "Address missing / new lot", "Lee County parcel. Confirm with the customer if lookup fails."),
      task("gate-plans", "Gates", "Plans already?", "Yes — analyze first. No — interview, then request plans."),
      task("gate-docs", "Gates", "Doc exceptions", "No new slab — hide impervious. Cape Coral — owl. Always — NOC."),
      task("gate-unsure", "Gates", "AI is unsure", "Ask the customer. Never invent a requirement."),
      task("gate-fail", "Gates", "Review fails", "10-bullet engineer letter — wait for a new set — review again."),
      task("gate-sign", "Gates", "Needs signature / notary", "Send, notify, nudge. File returns to the folder."),
      task("gate-human", "Gates", "Human confirms before Ready", "Ready is not city-approved."),

      // Definition of done
      task("dod-login-start", "Done when", "Login, find jobs, start in chat", "A contractor starts a Cape Coral screen enclosure on the thread."),
      task("dod-identify-prefill", "Done when", "Identify, prefill, review like Brian", "Only required docs. Official forms filled. Label + four setbacks."),
      task("dod-sign-folder", "Done when", "Sign, track, download", "Send for signature. See who has the ball. Download folder / ZIP."),
      task("dod-missing", "Done when", "Missing items have a source", "Chat says what it is and where to get it. No leftover rows."),
      task(
        "dod-stranger",
        "Done when",
        "A first-time contractor can finish one job",
        "Cape Coral screen enclosure, start to packet."
      ),
      task("dod-not", "Done when", "Say what is not done", "No city filing, no extra cities, no extra permit types, no rebuilt backend."),

      // Phase 2 baseline · already proven, must not regress
      phase2Proof("proof-01", "Create a new project", "A new project is created and opens the intake.", "start"),
      phase2Proof("proof-02", "Save the full project address", "The complete address is saved and reused downstream.", "discover"),
      phase2Proof("proof-03", "Identify City of Cape Coral", "The address resolves to City of Cape Coral permit authority.", "discover"),
      phase2Proof("proof-04", "Select Screen Enclosure permit", "The project is Screen Enclosure with the correct scenario.", "identify"),
      phase2Proof("proof-05", "Ask only relevant questions", "The flow asks only questions needed for this screen-enclosure checklist.", "discover"),
      phase2Proof("proof-06", "Reuse contractor profiles", "A saved contractor can be selected on another project.", "discover"),
      phase2Proof("proof-07", "Reuse owner profiles", "A saved owner can be selected on another project.", "discover"),
      phase2Proof("proof-08", "Reuse engineer and contact profiles", "A saved engineer or contact can be selected again.", "discover"),
      phase2Proof("proof-09", "Show the Cape Coral checklist", "The configured city and permit show the required checklist.", "identify"),
      phase2Proof("proof-10", "Upload against a document item", "An uploaded file stays attached to its requirement and enters the ZIP.", "gather"),
      phase2Proof("proof-11", "Identify missing items", "A missing required item stays visible and affects readiness.", "identify"),
      phase2Proof("proof-12", "Show signature and notary state", "The interface shows the next signature, notarization, or recording action.", "approvals"),
      phase2Proof("proof-13", "Prefill an official PDF", "F_DCD_1003, NOC, or owl form is generated from known project data.", "prefill"),
      phase2Proof("proof-14", "Edit prefilled data", "A corrected value survives regenerate and reopen.", "prefill"),
      phase2Proof("proof-15", "Show permit readiness", "Readiness is visible and changes when a counted item is completed.", "ready"),
      phase2Proof("proof-16", "Explain missing information", "Project chat explains a real missing item and its next action.", "gather"),
      phase2Proof("proof-17", "Keep permit and plan review distinct", "Document readiness and plan analysis remain separate jobs.", "review"),
      phase2Proof("proof-18", "Generate plan-review flags", "The review produces truthful red/yellow flags without certifying the job.", "review"),
      phase2Proof("proof-19", "Generate an engineer comment letter", "Flags produce a short letter that can be copied or downloaded.", "review"),
      phase2Proof("proof-20", "Download separate documents in a ZIP", "The packet ZIP contains separate attached and generated documents.", "ready"),
      phase2Proof("proof-21", "Keep PDFs readable", "Generated forms and reports have no overlapping text.", "prefill"),
      phase2Proof("proof-22", "Avoid generic no-checklist errors", "Cape Coral renders its checklist; out-of-scope cities get a specific message.", "identify"),
      phase2Proof("proof-23", "Complete one end-to-end pass", "Create → identify → gather → prefill → review → ZIP completes without breaking the chain.", "ready"),
      phase2Proof("proof-24", "Process the controlled sample", "The Apple Snail sample preserves known files and intentional gaps.", "review"),
      phase2Proof("proof-25", "Prove practical workflow output", "The project produces jurisdiction, checklist, forms, review output, and a fileable ZIP.", "ready"),

      // Guardrails
      task("guard-reuse", "Guardrails", "Reuse Phase 1–2 infrastructure", "Repackage plus gaps. Not a rebuilt backend."),
      task("guard-slack", "Guardrails", "Confirm open questions before building", "We will confirm product decisions before implementation."),
      task("guard-notary-seat", "Guardrails", "No Proof.com seat", "Send-and-notify only."),
      task("guard-no-autosubmit", "Guardrails", "No auto-submit to the city", "Customer files. Phase 4."),
      task("guard-no-cities", "Guardrails", "No other municipalities", "Cape Coral only in Phase 3."),
      task("guard-no-types", "Guardrails", "No extra permit types", "Screen enclosure only."),
      task("guard-no-bots", "Guardrails", "No municipal bots", "Out of Phase 3."),
    ],
    updatedAt: new Date().toISOString(),
  };
}
