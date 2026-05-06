const LS_KEY = "deennotes.preferred.quranenc.translation_key";

export function readPreferredQuranEncTranslationKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = localStorage.getItem(LS_KEY)?.trim().toLowerCase();
    return v?.length ? v : undefined;
  } catch {
    return undefined;
  }
}

export function writePreferredQuranEncTranslationKey(key: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!key?.trim()) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, key.trim().toLowerCase());
  } catch {
    /* quota */
  }
}

const OFFLINE_KEY = "deennotes.quran.offline_prep_intent";

export function readOfflineReadingPrepIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OFFLINE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeOfflineReadingPrepIntent(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) localStorage.setItem(OFFLINE_KEY, "1");
    else localStorage.removeItem(OFFLINE_KEY);
  } catch {
    /* ignore */
  }
}
