const LS_KEY = "deennotes.preferred.translation.ids";

/** Comma-separated translation resource IDs from Quran Foundation. */
export function readPreferredTranslationIds(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = localStorage.getItem(LS_KEY)?.trim();
    return v?.length ? v : undefined;
  } catch {
    return undefined;
  }
}

export function writePreferredTranslationIds(ids: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, ids.trim());
  } catch {
    /* quota */
  }
}
