import type { PrayerName, PrayerScheduleDto } from "../../api/types";

const SALAH_SEQUENCE: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export function prayerTimingToEpochMs(
  iso: string | undefined,
  clock: string | undefined,
): number | null {
  if (iso && iso.includes("T")) {
    const n = Date.parse(iso);
    return Number.isFinite(n) ? n : null;
  }
  const t = clock?.trim().split(/\s+/)[0] ?? "";
  if (!t.includes(":")) return null;
  const [hRaw, mRaw] = t.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function computePrayerSchedule(
  timings: Record<PrayerName, string>,
  timingsIso: Partial<Record<PrayerName, string>> | undefined,
  nowMs: number,
  tomorrowFajrIso?: string | null,
): PrayerScheduleDto {
  const iso = timingsIso ?? {};
  const epoch = (n: PrayerName) => prayerTimingToEpochMs(iso[n], timings[n]);

  const fajr = epoch("Fajr");
  if (fajr !== null && nowMs < fajr) {
    return {
      currentPrayer: null,
      currentLabel: "Still night · approaching Fajr",
      nextPrayer: "Fajr",
      nextAtIso: iso.Fajr ?? null,
      nextAtEpochMs: fajr,
    };
  }

  let currentPrayer: PrayerName | null = null;
  for (const name of SALAH_SEQUENCE) {
    const t = epoch(name);
    if (t !== null && t <= nowMs) currentPrayer = name;
  }

  for (const name of SALAH_SEQUENCE) {
    const t = epoch(name);
    if (t !== null && t > nowMs) {
      return {
        currentPrayer,
        currentLabel: gentleCurrentLabel(currentPrayer),
        nextPrayer: name,
        nextAtIso: iso[name] ?? null,
        nextAtEpochMs: t,
      };
    }
  }

  let nextEpoch: number | null = null;
  const tf = tomorrowFajrIso ?? null;
  if (tf?.includes("T")) nextEpoch = Date.parse(tf);

  return {
    currentPrayer: "Isha",
    currentLabel: "Night · resting before Fajr",
    nextPrayer: "Fajr",
    nextAtIso: tf,
    nextAtEpochMs: Number.isFinite(nextEpoch as number) ? (nextEpoch as number) : null,
  };
}

function gentleCurrentLabel(p: PrayerName | null): string {
  switch (p) {
    case "Fajr":
      return "Since Fajr";
    case "Dhuhr":
      return "Since Dhuhr";
    case "Asr":
      return "Since Asr";
    case "Maghrib":
      return "Since Maghrib";
    case "Isha":
      return "Since Isha";
    default:
      return "—";
  }
}
