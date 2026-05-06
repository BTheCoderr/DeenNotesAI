export const REFLECTION_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "id", label: "Indonesian (Bahasa)" },
  { code: "tr", label: "Turkish (Türkçe)" },
  { code: "fr", label: "French (Français)" },
] as const;

export type ReflectionLanguageCode =
  (typeof REFLECTION_LANGUAGE_OPTIONS)[number]["code"];

export type QuranPreferenceContract = {
  translationKey?: string;
  tafsirId?: number;
  /** Quran.com-style recitation resource id; defaults via server proxy if unset. */
  reciterId?: string;
  language?: ReflectionLanguageCode;
  offlineIntent: "none" | "planned" | "downloading" | "ready";
  immersiveReading: boolean;
  /** When true, verse audio caches only fetch on unmetered (Wi‑Fi where detectable). */
  audioWifiOnly?: boolean;
  /** Max approximate storage for verse audio (~MB); LRU eviction. */
  audioMaxCacheMb?: number;
  /** When online, softly prefetch audio for continue-reading surah (never full Quran). */
  autoDownloadContinueSurah?: boolean;
  /** Placeholder until server exposes multiple bitrate selections. */
  audioQuality?: "default" | "high";
};

