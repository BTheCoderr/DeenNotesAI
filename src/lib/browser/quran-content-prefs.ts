export const TAFSIR_RESOURCE_LS = "deennotes.quran.preferred.tafsir_resource_id";
export const RECITER_RESOURCE_LS = "deennotes.quran.preferred.reciter_resource_id";
export const REFLECTION_LOCALE_LS = "deennotes.reflection.locale";

/** BCP-like simple codes for reflection UI preference */
export const REFLECTION_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "id", label: "Indonesian (Bahasa)" },
  { code: "tr", label: "Turkish (Türkçe)" },
  { code: "fr", label: "French (Français)" },
] as const;

export type ReflectionLocale =
  (typeof REFLECTION_LANGUAGE_OPTIONS)[number]["code"];

export function readPreferredTafsirResourceId(): number | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = Number(localStorage.getItem(TAFSIR_RESOURCE_LS));
    return Number.isFinite(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

export function writePreferredTafsirResourceId(id: number | null) {
  if (typeof window === "undefined") return;
  try {
    if (id === null || !Number.isFinite(id))
      localStorage.removeItem(TAFSIR_RESOURCE_LS);
    else localStorage.setItem(TAFSIR_RESOURCE_LS, String(id));
  } catch {
    /* quota */
  }
}

export function readPreferredReciterResourceId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = localStorage.getItem(RECITER_RESOURCE_LS)?.trim();
    return v || undefined;
  } catch {
    return undefined;
  }
}

export function writePreferredReciterResourceId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!id?.trim()) localStorage.removeItem(RECITER_RESOURCE_LS);
    else localStorage.setItem(RECITER_RESOURCE_LS, id.trim());
  } catch {
    /* quota */
  }
}

export function readReflectionLocale(): ReflectionLocale | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(REFLECTION_LOCALE_LS)?.trim().toLowerCase();
    const hit = REFLECTION_LANGUAGE_OPTIONS.some((o) => o.code === raw);
    return hit ? (raw as ReflectionLocale) : undefined;
  } catch {
    return undefined;
  }
}

export function writeReflectionLocale(code: ReflectionLocale | null) {
  if (typeof window === "undefined") return;
  try {
    if (!code) localStorage.removeItem(REFLECTION_LOCALE_LS);
    else localStorage.setItem(REFLECTION_LOCALE_LS, code);
  } catch {
    /* quota */
  }
}
