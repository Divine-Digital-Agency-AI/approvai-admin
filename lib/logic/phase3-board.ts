import type { LogicBoard } from "./types";

export const PHASE3_BOARD_ID = "phase-3";
export const LOGIC_SEED_VERSION = 8;

export function createPhase3Board(): LogicBoard {
  return {
    id: PHASE3_BOARD_ID,
    version: LOGIC_SEED_VERSION,
    title: "Cape Coral screen enclosure",
    subtitle:
      "A contractor who has never used this should finish one job and walk away with a packet they can file.",
    boardStatus: "ready",
    summary:
      "Phase 2 is the engine. Phase 3 is the same job, run from chat. Compare today vs proposed, then the stage grid, then gates. Scope is Cape Coral screen enclosure only.",
    inScope: [
      "Cape Coral screen enclosure only.",
      "Chat-first Identify → Prefill → Review.",
      "Required docs only. Always NOC. Hide leftovers.",
      "Short Brian-style review. Send to sign / Proof.com. One folder / ZIP.",
    ],
    phase4: [
      "Customer files with the city. No auto-submit.",
      "Other municipalities, extra permit types, city bots.",
    ],
    assumptions: [
      "Reuse Phase 1–2 infrastructure. This is a repackage plus gaps, not a rebuilt backend.",
      "Brian answers live Slack questions during build.",
      "Notary is send-and-notify. We do not buy a Proof.com seat.",
      "Ready means the packet is complete. It does not mean the city approved it.",
    ],
    compareEyebrow: "Compare",
    compareTitle: "Phase 2 today vs Phase 3 proposed",
    compare: [
      {
        id: "today",
        title: "Today (Phase 2)",
        items: [
          "Customer fills a 6-step wizard, then a checklist.",
          "Chat sits on the side. It does not run the job.",
          "Some leftover documents still appear.",
          "Plan review is a long report.",
          "Signatures and notary are mostly manual.",
          "Works as a permit kit. Does not yet feel like Brian.",
        ],
      },
      {
        id: "proposed",
        title: "Proposed (Phase 3)",
        proposed: true,
        items: [
          "Customer talks. The system runs the job.",
          "Chat is the main path. Forms stay as a power-user canvas.",
          "Only required documents appear.",
          "Review is short: pass, or about 10 engineer bullets.",
          "Prefill, send to sign, and notify on notary.",
          "A first-time user can finish a Cape Coral screen enclosure.",
        ],
      },
    ],
    journeyEyebrow: "Journey",
    journeyTitle: "Identify → Prefill → Review",
    journeyHint: "Left to right. Rows are contractor, system, and external.",
    stages: [
      {
        id: "start",
        title: "1 Start",
        customer: "Logs in. Finds or starts a project. Searches 50+.",
        system: "Shows projects, status, and search. Opens a thread, not a wizard.",
        external: "",
      },
      {
        id: "discover",
        title: "2 Discover",
        customer: "Gives address and intent: “pool screen enclosure.” Answers 3 questions: pool or lanai, size, slab.",
        system: "Looks up Lee County parcel, owner, zoning. Shows work in progress.",
        external: "Public records (Lee County / Cape Coral).",
      },
      {
        id: "identify",
        title: "3 Identify",
        customer: "Confirms the permit type and the short doc list.",
        system: "Builds the required list. Hides leftovers. Always includes NOC.",
        external: "",
      },
      {
        id: "gather",
        title: "4 Gather",
        customer: "Uploads plans / missing items, or asks “where do I get this?”",
        system: "If plans exist, reads them first. Explains how to get missing items.",
        external: "Engineer if a new set is required later.",
      },
      {
        id: "prefill",
        title: "5 Prefill",
        customer: "Reviews prefilled forms. Confirms or corrects.",
        system: "Prefills NOC, owl, and F_DCD_1003 from chat, parcel, and plans.",
        external: "",
      },
      {
        id: "review",
        title: "6 Review",
        customer: "Sees pass / fail. Does not read a long report.",
        system: "Checks like Brian: label + four setbacks. Writes ~10 bullets if it fails.",
        external: "Engineer receives the short comment list.",
      },
      {
        id: "approvals",
        title: "7 Approvals",
        customer: "Sends docs to owner / signer. Tracks status.",
        system: "Routes signature. Sends notary link if needed. Nudges until it returns.",
        external: "Owner / signer. Notary via Proof.com or print.",
      },
      {
        id: "ready",
        title: "8 Ready",
        customer: "Downloads packet. Files with the city.",
        system: "One folder per job. ZIP packet. Not auto-submit to the city.",
        external: "City of Cape Coral (manual file). Phase 4.",
      },
    ],
    gatesEyebrow: "Gates",
    gatesTitle: "Exceptions and loops",
    gates: [
      "New vs existing project — search or start a thread.",
      "Address missing / new lot — Lee County parcel; confirm if lookup fails.",
      "Plans already? Yes — analyze first. No — interview, then request plans.",
      "No new slab — hide impervious. Cape Coral — owl. Always — NOC.",
      "AI is unsure — ask the customer to confirm. Never invent a requirement.",
      "Review fails — 10-bullet engineer letter — wait for a new set — review again.",
      "Needs signature / notary — send, notify, nudge. File returns to the folder.",
      "Human confirms packet before Ready. Ready is not city-approved.",
    ],
    decisionsEyebrow: "Approvals",
    decisionsTitle: "Please confirm these six points",
    decisionsHint:
      "Please let us know if any part of this needs to change. Your feedback will help us confirm the direction before implementation begins.",
    decisions: [
      {
        id: "d1",
        text: "Confirm this is the customer experience we should build.",
        note: "The contractor works in a conversation. Forms remain available, but they do not drive the process.",
        status: "open",
      },
      {
        id: "d2",
        text: "Confirm the three starting questions are enough.",
        note: "For a screen enclosure we ask: pool or lanai, size, and whether there is a new slab. That should identify the permit path.",
        status: "open",
      },
      {
        id: "d3",
        text: "Confirm the required documents for this permit type.",
        note: "Site plan, structural plans, Notice of Commencement, and the owl form. If there is no new slab, the impervious-surface item is hidden.",
        status: "open",
      },
      {
        id: "d4",
        text: "Confirm how plan review should look to the customer.",
        note: "A simple pass or fail, plus a short list of about ten items for the engineer if it fails. The customer sees only what they need to know.",
        status: "open",
      },
      {
        id: "d5",
        text: "Confirm how signatures and notarization should work.",
        note: "We send the document for signature or notarization and notify the contractor. The contractor remains responsible for completing that step.",
        status: "open",
      },
      {
        id: "d6",
        text: "Confirm when this work is complete.",
        note: "A first-time contractor can finish one Cape Coral screen-enclosure permit packet without training or permitting experience.",
        status: "open",
      },
    ],
    outOfScope:
      "Not included now: other cities, automatic filing with the city, or additional permit types.",
    dodEyebrow: "Definition of done",
    dodTitle: "Phase 3 is complete when",
    dod: [
      "A contractor can log in, find their jobs, and start a Cape Coral screen enclosure in chat.",
      "The system identifies only the documents that apply, prefills the official forms, and reviews the site plan in Brian’s terms.",
      "The customer can send a document for signature, see who has the ball, and download a clean project folder / ZIP.",
      "If something is missing, chat says what it is and where to get it. No leftover checklist rows.",
      "This initial release focuses on Cape Coral screen enclosures. City filing, additional municipalities, and additional permit types can follow.",
    ],
    updatedAt: new Date().toISOString(),
  };
}
