/** Pure helpers for Quran.com verse merge — Vitest-covered (no `server-only`). */

export type UthmaniVerseRow = {
  verse_key?: string | null;
  text_uthmani?: string | null;
};

/** Index rows by trimmed `verse_key` (e.g. `1:1`). */
export function indexUthmaniByVerseKey(
  rows: UthmaniVerseRow[],
): Map<string, UthmaniVerseRow> {
  const m = new Map<string, UthmaniVerseRow>();
  for (const r of rows) {
    const k = typeof r.verse_key === "string" ? r.verse_key.trim() : "";
    if (k.length) m.set(k, r);
  }
  return m;
}

export type TranslationRow = {
  text?: string | null;
  resource_id?: number | null;
};

/**
 * Quran.com `quran/translations/:id` for a chapter returns lines in ascending verse order with no verse_key.
 * Zip with verses sorted by `verseNumber`.
 */
export function zipChapterTranslationsOrdered(
  verseNumbersSorted: readonly number[],
  translationsOrdered: readonly TranslationRow[],
): Map<number, TranslationRow> {
  const map = new Map<number, TranslationRow>();
  if (verseNumbersSorted.length !== translationsOrdered.length) {
    return map;
  }
  for (let i = 0; i < verseNumbersSorted.length; i++) {
    const vn = verseNumbersSorted[i];
    const t = translationsOrdered[i];
    if (typeof vn !== "number" || !t) continue;
    map.set(vn, t);
  }
  return map;
}
