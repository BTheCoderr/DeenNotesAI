import AsyncStorage from "@react-native-async-storage/async-storage";

import type { MobilePrayerLocationPrefs } from "./mobile-prayer-prefs";

const KEY = "deennotes.mobile.prayer.syncMeta.v1";

type SyncMeta = {
  utcDayKey: string;
  fetchedAtEpochMs: number;
  prefsFingerprint: string;
};

function localDayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function prayerPrefsFingerprint(p: MobilePrayerLocationPrefs | null): string {
  if (!p) return "defaults";
  const lat = p.latitude ?? "x";
  const lng = p.longitude ?? "x";
  return `${p.locationMode}|${p.method}|${p.school}|${p.adjustment ?? 0}|${lat}|${lng}|${p.city}|${p.country}|${p.region ?? ""}`;
}

async function readMeta(): Promise<SyncMeta | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<SyncMeta>;
    if (
      typeof o.utcDayKey === "string" &&
      typeof o.fetchedAtEpochMs === "number" &&
      typeof o.prefsFingerprint === "string"
    ) {
      return o as SyncMeta;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeMeta(next: SyncMeta): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

/** Location / salah-day drift only — finer refresh handled by TanStack staleTime/focus hooks. */
export async function prayerDataShouldInvalidate(prefs: MobilePrayerLocationPrefs | null): Promise<boolean> {
  const meta = await readMeta();
  if (!meta) return false;
  const fp = prayerPrefsFingerprint(prefs);
  const day = localDayKey();
  if (meta.prefsFingerprint !== fp) return true;
  if (meta.utcDayKey !== day) return true;
  return false;
}

export async function prayerDataMarkSynced(prefs: MobilePrayerLocationPrefs | null): Promise<void> {
  await writeMeta({
    utcDayKey: localDayKey(),
    fetchedAtEpochMs: Date.now(),
    prefsFingerprint: prayerPrefsFingerprint(prefs),
  });
}
