import type { PrayerPrefsStored } from "@/lib/prayer/prefs-shape";
import { DEFAULT_PRAYER_PREFS } from "@/lib/prayer/prefs-shape";

import { coerceCalculationMethod } from "@/lib/prayer/types";

export const PRAYER_PREFS_LS_KEY = "deennotes.prayer.prefs.v1";

function migrateStoredMethod(method: number): number {
  return coerceCalculationMethod(method);
}

export function readPrayerPrefs(): PrayerPrefsStored {
  if (typeof window === "undefined") return { ...DEFAULT_PRAYER_PREFS };
  try {
    const raw = localStorage.getItem(PRAYER_PREFS_LS_KEY);
    if (!raw) return { ...DEFAULT_PRAYER_PREFS };
    const o = JSON.parse(raw) as Record<string, unknown>;
    const city =
      typeof o.city === "string" && o.city.trim() ? o.city.trim() : DEFAULT_PRAYER_PREFS.city;
    const country =
      typeof o.country === "string" && o.country.trim()
        ? o.country.trim()
        : DEFAULT_PRAYER_PREFS.country;
    const region =
      typeof o.region === "string" && o.region.trim()
        ? o.region.trim()
        : DEFAULT_PRAYER_PREFS.region;
    const method = migrateStoredMethod(
      typeof o.method === "number" && Number.isFinite(o.method)
        ? Math.trunc(o.method)
        : DEFAULT_PRAYER_PREFS.method,
    );
    const school = o.school === 1 ? 1 : 0;
    const useBrowserLocation = o.useBrowserLocation === true;
    const hijriAdj = Number(o.hijriAdjustment);
    const hijriAdjustment = Number.isFinite(hijriAdj) ? Math.trunc(hijriAdj) : 0;
    const notif = (o.notifications as PrayerPrefsStored["notifications"]) ?? undefined;
    const ram = (o.ramadan as PrayerPrefsStored["ramadan"]) ?? DEFAULT_PRAYER_PREFS.ramadan;
    return {
      city,
      country,
      ...(region ? { region } : {}),
      method,
      school,
      useBrowserLocation,
      hijriAdjustment,
      ...(notif ? { notifications: notif } : {}),
      ramadan: ram ?? DEFAULT_PRAYER_PREFS.ramadan,
    };
  } catch {
    return { ...DEFAULT_PRAYER_PREFS };
  }
}

export function writePrayerPrefs(next: PrayerPrefsStored) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      PRAYER_PREFS_LS_KEY,
      JSON.stringify({
        ...next,
        method: coerceCalculationMethod(next.method),
      }),
    );
  } catch {
    /* quota */
  }
}
