import type { QuranRef } from "@/lib/quran/types";

import { maxVerseForChapter } from "./chapter-verse-counts";

/** Chapter:verse patterns (ASCII digits only; conservative word boundaries). */
const COLON_PAIR = /\b([1-9]\d{0,2})\s*:\s*(\d{1,3})\b/g;

export function normalizeQuranRefs(refs: QuranRef[]): QuranRef[] {
  const seen = new Set<string>();
  const out: QuranRef[] = [];
  for (const r of refs) {
    const c = Math.trunc(r.chapter);
    const v = Math.trunc(r.verse);
    if (c < 1 || c > 114 || v < 1) continue;
    const max = maxVerseForChapter(c);
    if (!max || v > max) continue;
    const k = `${c}:${v}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ chapter: c, verse: v });
  }
  return out;
}

export function extractQuranRefsFromPlainText(text: string): QuranRef[] {
  if (!text) return [];
  const found: QuranRef[] = [];
  for (const m of text.matchAll(COLON_PAIR)) {
    found.push({
      chapter: Number(m[1]),
      verse: Number(m[2]),
    });
  }
  return normalizeQuranRefs(found);
}
