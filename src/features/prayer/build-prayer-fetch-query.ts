import type { PrayerPrefsStored } from "@/lib/prayer/prefs-shape";

export type GeoPosition = GeolocationPosition | null;

/** Builds query string for `/api/prayer/*` routes (server proxy to AlAdhan). */
export function buildPrayerFetchQuery(
  prefs: PrayerPrefsStored,
  geo: GeoPosition,
): string {
  const p = new URLSearchParams();
  p.set("method", String(prefs.method));
  p.set("school", String(prefs.school));
  if (prefs.useBrowserLocation && geo) {
    p.set("latitude", String(geo.coords.latitude));
    p.set("longitude", String(geo.coords.longitude));
  } else {
    p.set("city", prefs.city);
    p.set("country", prefs.country);
  }
  const adj = prefs.hijriAdjustment;
  if (adj != null && adj !== 0 && Number.isFinite(adj)) {
    p.set("adjustment", String(Math.trunc(adj)));
  }
  if (prefs.region?.trim()) p.set("region", prefs.region.trim());
  return p.toString();
}
