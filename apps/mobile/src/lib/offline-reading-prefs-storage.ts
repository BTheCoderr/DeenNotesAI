import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_OFFLINE_READING_PREFS,
  OFFLINE_CACHE_SURAH_MAX,
  OFFLINE_CACHE_SURAH_MIN,
  type OfflineReadingPreferencesV1,
} from "../contracts/offline-reading-preferences";

const KEY = "deennotes.mobile.prefs.offlineReading.v1";

export async function readOfflineReadingPreferences(): Promise<OfflineReadingPreferencesV1> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_OFFLINE_READING_PREFS;
    const o = JSON.parse(raw) as Partial<OfflineReadingPreferencesV1>;
    if (o.schemaVersion !== 1) return DEFAULT_OFFLINE_READING_PREFS;
    const maxCached = Number(o.maxCachedSurahs);
    const clampedMax = Number.isFinite(maxCached)
      ? Math.min(OFFLINE_CACHE_SURAH_MAX, Math.max(OFFLINE_CACHE_SURAH_MIN, Math.trunc(maxCached)))
      : DEFAULT_OFFLINE_READING_PREFS.maxCachedSurahs;
    return {
      ...DEFAULT_OFFLINE_READING_PREFS,
      ...o,
      schemaVersion: 1,
      maxCachedSurahs: clampedMax,
    };
  } catch {
    return DEFAULT_OFFLINE_READING_PREFS;
  }
}

export async function writeOfflineReadingPreferences(
  next: Partial<OfflineReadingPreferencesV1>,
): Promise<void> {
  const prev = await readOfflineReadingPreferences();
  const maxNext = Number(next.maxCachedSurahs);
  const clamped =
    next.maxCachedSurahs != null && Number.isFinite(maxNext)
      ? Math.min(OFFLINE_CACHE_SURAH_MAX, Math.max(OFFLINE_CACHE_SURAH_MIN, Math.trunc(maxNext)))
      : prev.maxCachedSurahs;
  const merged: OfflineReadingPreferencesV1 = {
    ...DEFAULT_OFFLINE_READING_PREFS,
    ...prev,
    ...next,
    schemaVersion: 1,
    maxCachedSurahs: clamped,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}
