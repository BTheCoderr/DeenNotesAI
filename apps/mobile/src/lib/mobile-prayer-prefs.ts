import AsyncStorage from "@react-native-async-storage/async-storage";

/** Mirrors web prayer location/method prefs for API query construction. */
export type MobilePrayerLocationPrefs = {
  city: string;
  country: string;
  region?: string;
  method: number;
  school: 0 | 1;
  adjustment?: number;
};

const KEY = "deennotes.mobile.prayer.locationPrefs.v1";

export async function readMobilePrayerLocationPrefs(): Promise<MobilePrayerLocationPrefs | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<MobilePrayerLocationPrefs>;
    if (!o.city || !o.country) return null;
    return {
      city: o.city,
      country: o.country,
      region: o.region,
      method: typeof o.method === "number" ? o.method : 2,
      school: o.school === 1 ? 1 : 0,
      adjustment: typeof o.adjustment === "number" ? o.adjustment : undefined,
    };
  } catch {
    return null;
  }
}

export async function writeMobilePrayerLocationPrefs(
  next: Partial<MobilePrayerLocationPrefs> & Pick<MobilePrayerLocationPrefs, "city" | "country">,
): Promise<void> {
  const prev = await readMobilePrayerLocationPrefs();
  const merged: MobilePrayerLocationPrefs = {
    city: next.city,
    country: next.country,
    region: next.region ?? prev?.region,
    method: next.method ?? prev?.method ?? 2,
    school: next.school ?? prev?.school ?? 0,
    adjustment: next.adjustment ?? prev?.adjustment,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}
