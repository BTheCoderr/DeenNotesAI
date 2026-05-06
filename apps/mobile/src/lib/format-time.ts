/** Human-friendly countdown for next prayer. */
export function formatCountdown(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  if (ms <= 0) return "Now";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

/** Softer wording for headings e.g. "Prayer in 12m". */
export function formatPrayerInPhrase(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "Salah rhythm";
  if (ms <= 0) return "Pray now, unhurried";
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Prayer in under a minute";
  if (mins < 60) return `Prayer in ${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `Prayer in ${h}h ${m}m` : `Prayer in ${h}h`;
}
