import type { PrayerTodayPayload } from "@/lib/prayer/types";
import type { PrayerPrefsStored } from "@/lib/prayer/prefs-shape";
import { readPrayerPrefs } from "@/lib/browser/prayer-prefs";

import {
  buildPrayerFetchQuery,
  type GeoPosition,
} from "@/features/prayer/build-prayer-fetch-query";

/**
 * Lightweight fetch helper for Prayer surfaces (Expo can mirror the `/api/prayer/today`
 * contract behind a native client or replicate query building from prefs + coords).
 */

export async function fetchPrayerToday(opts: {
  prefs: PrayerPrefsStored;
  geo: GeoPosition;
}): Promise<PrayerTodayPayload | null> {
  const qs = buildPrayerFetchQuery(opts.prefs, opts.geo);
  const res = await fetch(`/api/prayer/today?${qs}`, { cache: "no-store" });
  const j = (await res.json()) as PrayerTodayPayload | { ok?: false };
  if (!res.ok || !j || typeof j !== "object" || !("schedule" in j) || !j.ok) return null;
  return j as PrayerTodayPayload;
}

export async function getCoarseGeoForPrayer(timeoutMs = 8000): Promise<GeoPosition> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (g) => resolve(g),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        maximumAge: 120_000,
        timeout: timeoutMs,
      },
    );
  });
}

/** Returns prefs + refreshed today payload — no React state coupling. */
export async function reloadPrayerTodayFromDevice(): Promise<PrayerTodayPayload | null> {
  const prefs = readPrayerPrefs();
  const geo =
    prefs.useBrowserLocation && typeof navigator !== "undefined"
      ? await getCoarseGeoForPrayer()
      : null;
  return fetchPrayerToday({ prefs, geo });
}
