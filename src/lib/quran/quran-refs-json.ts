import type { QuranRef } from "@/lib/quran/types";

import { normalizeQuranRefs } from "./extract-quran-refs";

/**
 * Best-effort parse of stored `quran_refs` jsonb (AI or future manual edits).
 */
export function asQuranRefs(value: unknown): QuranRef[] {
  if (!Array.isArray(value)) return [];
  const raw: QuranRef[] = [];
  for (const el of value) {
    if (!el || typeof el !== "object") continue;
    const o = el as { chapter?: unknown; verse?: unknown };
    const chapter = Number(o.chapter);
    const verse = Number(o.verse);
    if (!Number.isFinite(chapter) || !Number.isFinite(verse)) continue;
    raw.push({ chapter, verse });
  }
  return normalizeQuranRefs(raw);
}
