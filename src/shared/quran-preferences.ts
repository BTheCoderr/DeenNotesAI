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
  reciterId?: string;
  language?: ReflectionLanguageCode;
  offlineIntent: "none" | "planned" | "downloading" | "ready";
  immersiveReading: boolean;
};
