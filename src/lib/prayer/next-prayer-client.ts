import type { PrayerName } from "./types";

export const PRAYER_CYCLE_ORDER: PrayerName[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

function normalizeTime(raw: string): string {
  const head = raw.trim().split(/\s+/)[0] ?? raw;
  return head.includes(":") ? head : raw.trim();
}

/** Parse HH:mm into a Date today in the user's local timezone (for countdown). */
function todayAt(timeStr: string): Date | null {
  const t = normalizeTime(timeStr);
  const [hRaw, mRaw] = t.split(":");
  const h = Number(hRaw);
  const min = Number(mRaw);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
}

export type NextPrayerResult = {
  name: PrayerName;
  /** ms epoch */
  at: number;
} | null;

export function computeNextPrayer(
  timings: Record<PrayerName, string>,
  nowMs: number = Date.now(),
): NextPrayerResult {
  let best: { name: PrayerName; at: number } | null = null;
  for (const name of PRAYER_CYCLE_ORDER) {
    const dt = todayAt(timings[name] ?? "");
    if (!dt) continue;
    const t = dt.getTime();
    if (t > nowMs && (!best || t < best.at)) best = { name, at: t };
  }
  if (best) return best;
  const fajr = todayAt(timings.Fajr ?? "");
  if (fajr) return { name: "Fajr", at: fajr.getTime() + 24 * 60 * 60 * 1000 };
  return null;
}

export function formatCountdown(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
