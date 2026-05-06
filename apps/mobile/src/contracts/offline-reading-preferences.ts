export type OfflineReadingPreferencesV1 = {
  schemaVersion: 1;
  /** When false, no verse payloads are written to the lightweight cache. */
  cacheEnabled: boolean;
  /** Max distinct surahs retained (LRU-ish by last read). */
  maxCachedSurahs: number;
};

export const DEFAULT_OFFLINE_READING_PREFS: OfflineReadingPreferencesV1 = {
  schemaVersion: 1,
  cacheEnabled: true,
  maxCachedSurahs: 8,
};

export const OFFLINE_CACHE_SURAH_MIN = 4;
export const OFFLINE_CACHE_SURAH_MAX = 16;
