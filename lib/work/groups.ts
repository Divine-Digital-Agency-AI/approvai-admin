export const WORK_GROUPS = [
  { id: "brian-sign-off", name: "Brian sign-off" },
  { id: "slice-1", name: "1 · Find project and start chat" },
  { id: "slice-2", name: "2 · Identify requirements" },
  { id: "slice-3", name: "3 · Prefill documents" },
  { id: "slice-4", name: "4 · Review like Brian" },
  { id: "slice-5", name: "5 · Signature and tracking" },
  { id: "slice-6", name: "6 · Complete packet" },
  { id: "release-criteria", name: "Release criteria" },
  { id: "phase-2-proof", name: "Phase 2 proof" },
] as const;

export function workGroupId(name: string): string {
  const known = WORK_GROUPS.find((group) => group.name === name);
  return known?.id ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function scrollToWorkGroup(id: string) {
  document.getElementById(`work-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
