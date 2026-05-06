import type { Chapter } from "../api/types";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function stableLocalDaySeed(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Deterministic surah/ayah for a calendar day from chapter verse counts (no duplicate API logic). */
export function pickDailyAyahRef(daySeed: string, chapters: Chapter[]): { surahId: number; ayah: number } {
  if (!chapters.length) {
    const h = hashSeed(daySeed);
    return { surahId: 1 + (h % 114), ayah: 1 + (h % 7) };
  }
  const total = chapters.reduce((s, c) => s + Math.max(0, Math.trunc(c.versesCount)), 0);
  if (total <= 0) return { surahId: 1, ayah: 1 };
  let target = (hashSeed(daySeed) % total) + 1;
  for (const c of chapters) {
    const n = Math.max(0, Math.trunc(c.versesCount));
    if (n <= 0) continue;
    if (target <= n) return { surahId: c.id, ayah: target };
    target -= n;
  }
  return { surahId: chapters[0].id, ayah: 1 };
}
