const LABELS: Record<string, string> = {
  created: "Setup",
  processing: "Processing",
  ready: "Ready",
  completed: "Application finalized",
};

export function getProjectStatusLabel(status: string | undefined | null): string {
  if (!status) return "Setup";
  return LABELS[status] ?? status;
}
