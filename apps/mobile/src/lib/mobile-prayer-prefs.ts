import AsyncStorage from "@react-native-async-storage/async-storage";

import { LOCATION_FALLBACK } from "../contracts/prayer-preferences";

export type PrayerLocationMode = "device" | "manual";

/** Mirrors web prayer location/method prefs for API query construction. */
export type MobilePrayerLocationPrefs = {
  locationMode: PrayerLocationMode;
  /** Used when `locationMode === "device"` and permission + fix are available. */
  latitude?: number;
  longitude?: number;
  city: string;
  country: string;
  region?: string;
  method: number;
  school: 0 | 1;
  adjustment?: number;
};

const KEY = "deennotes.mobile.prayer.locationPrefs.v2";

function defaultPrefs(): MobilePrayerLocationPrefs {
  return {
    locationMode: "manual",
    city: LOCATION_FALLBACK.city,
    country: LOCATION_FALLBACK.country,
    region: LOCATION_FALLBACK.region,
    method: 2,
    school: 0,
  };
}

function migrateLegacy(raw: string): MobilePrayerLocationPrefs | null {
  try {
    const o = JSON.parse(raw) as Partial<MobilePrayerLocationPrefs> & {
      city?: string;
      country?: string;
    };
    if (!o.city || !o.country) return null;
    const hasCoords =
      typeof o.latitude === "number" &&
      typeof o.longitude === "number" &&
      Number.isFinite(o.latitude) &&
      Number.isFinite(o.longitude);
    return {
      locationMode: o.locationMode ?? (hasCoords ? "device" : "manual"),
      latitude: hasCoords ? o.latitude : undefined,
      longitude: hasCoords ? o.longitude : undefined,
      city: o.city,
      country: o.country,
      region: o.region ?? LOCATION_FALLBACK.region,
      method: typeof o.method === "number" ? o.method : 2,
      school: o.school === 1 ? 1 : 0,
      adjustment: typeof o.adjustment === "number" ? o.adjustment : undefined,
    };
  } catch {
    return null;
  }
}

export async function readMobilePrayerLocationPrefs(): Promise<MobilePrayerLocationPrefs | null> {
  try {
    let raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      raw = await AsyncStorage.getItem("deennotes.mobile.prayer.locationPrefs.v1");
      const legacy = raw ? migrateLegacy(raw) : null;
      if (legacy) {
        await AsyncStorage.setItem(KEY, JSON.stringify(legacy));
        return legacy;
      }
      return null;
    }
    const o = JSON.parse(raw) as Partial<MobilePrayerLocationPrefs>;
    if (!o.city || !o.country) return null;
    const hasCoords =
      typeof o.latitude === "number" &&
      typeof o.longitude === "number" &&
      Number.isFinite(o.latitude) &&
      Number.isFinite(o.longitude);
    return {
      locationMode: o.locationMode ?? (hasCoords ? "device" : "manual"),
      latitude: hasCoords ? o.latitude : undefined,
      longitude: hasCoords ? o.longitude : undefined,
      city: o.city,
      country: o.country,
      region: o.region ?? LOCATION_FALLBACK.region,
      method: typeof o.method === "number" ? o.method : 2,
      school: o.school === 1 ? 1 : 0,
      adjustment: typeof o.adjustment === "number" ? o.adjustment : undefined,
    };
  } catch {
    return null;
  }
}

export async function writeMobilePrayerLocationPrefs(
  next: Partial<MobilePrayerLocationPrefs>,
): Promise<void> {
  const prev = (await readMobilePrayerLocationPrefs()) ?? defaultPrefs();
  const merged: MobilePrayerLocationPrefs = {
    locationMode: next.locationMode ?? prev.locationMode,
    latitude: "latitude" in next ? next.latitude : prev.latitude,
    longitude: "longitude" in next ? next.longitude : prev.longitude,
    city: next.city ?? prev.city,
    country: next.country ?? prev.country,
    region: next.region ?? prev.region,
    method: next.method ?? prev.method,
    school: next.school ?? prev.school,
    adjustment:
      next.adjustment !== undefined ? next.adjustment : prev.adjustment,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}

export { defaultPrefs as defaultMobilePrayerLocationPrefs };
