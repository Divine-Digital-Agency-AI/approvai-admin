export function formatSavedAt(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Saved";
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 4) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "Saved 1 minute ago";
  if (minutes < 60) return `Saved ${minutes} minutes ago`;
  return "Saved";
}
