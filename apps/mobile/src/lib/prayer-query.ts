import type { PrayerTodayQuery } from "../api/prayer";
import { LOCATION_FALLBACK } from "../contracts/prayer-preferences";

import type { MobilePrayerLocationPrefs } from "./mobile-prayer-prefs";

export function prayerTodayQueryFromPrefs(
  prefs: MobilePrayerLocationPrefs | null,
): PrayerTodayQuery {
  const method = prefs?.method ?? 2;
  const school: 0 | 1 = prefs?.school === 1 ? 1 : 0;
  const adjustment =
    typeof prefs?.adjustment === "number" ? prefs.adjustment : undefined;

  const base = { method, school, adjustment };
  const mode = prefs?.locationMode ?? "manual";
  const lat = prefs?.latitude;
  const lng = prefs?.longitude;

  if (
    mode === "device" &&
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return { ...base, latitude: lat, longitude: lng };
  }

  return {
    ...base,
    city: (prefs?.city ?? LOCATION_FALLBACK.city).trim(),
    country: (prefs?.country ?? LOCATION_FALLBACK.country).trim(),
    region: (prefs?.region ?? LOCATION_FALLBACK.region).trim(),
  };
}
