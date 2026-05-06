import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  QuranPreferenceContract,
  ReflectionLanguageCode,
} from "../contracts/quran-preferences";

const KEY = "deennotes.mobile.quran.prefs.v1";

const defaultPrefs: QuranPreferenceContract = {
  language: "en",
  offlineIntent: "none",
  immersiveReading: false,
  audioWifiOnly: false,
  audioMaxCacheMb: 200,
  autoDownloadContinueSurah: false,
  audioQuality: "default",
};

function clampCacheMb(n: number): number {
  if (!Number.isFinite(n)) return defaultPrefs.audioMaxCacheMb!;
  return Math.min(800, Math.max(32, Math.round(n)));
}

export async function readMobileQuranPrefs(): Promise<QuranPreferenceContract> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...defaultPrefs };
    const o = JSON.parse(raw) as Partial<QuranPreferenceContract>;
    const audioQuality =
      o.audioQuality === "high" || o.audioQuality === "default"
        ? o.audioQuality
        : defaultPrefs.audioQuality;
    return {
      ...defaultPrefs,
      ...o,
      language:
        o.language && typeof o.language === "string"
          ? (o.language as ReflectionLanguageCode)
          : defaultPrefs.language,
      offlineIntent: o.offlineIntent ?? defaultPrefs.offlineIntent,
      immersiveReading: Boolean(o.immersiveReading),
      audioWifiOnly: typeof o.audioWifiOnly === "boolean" ? o.audioWifiOnly : defaultPrefs.audioWifiOnly,
      audioMaxCacheMb:
        typeof o.audioMaxCacheMb === "number"
          ? clampCacheMb(o.audioMaxCacheMb)
          : defaultPrefs.audioMaxCacheMb,
      autoDownloadContinueSurah:
        typeof o.autoDownloadContinueSurah === "boolean"
          ? o.autoDownloadContinueSurah
          : defaultPrefs.autoDownloadContinueSurah,
      audioQuality,
    };
  } catch {
    return { ...defaultPrefs };
  }
}

export async function writeMobileQuranPrefs(
  next: Partial<QuranPreferenceContract>,
): Promise<void> {
  const prev = await readMobileQuranPrefs();
  const merged: QuranPreferenceContract = { ...prev, ...next };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}
