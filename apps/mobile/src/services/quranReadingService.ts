import type {
  QuranBookmarkV1,
  QuranReadingModeId,
  QuranReadingProgressV1,
  QuranSelectedRangeV1,
} from "../types/quran-reading";
import { ayahKey } from "../types/quran-reading";
import {
  readQuranReadingProgressV1,
  writeQuranReadingProgressV1,
} from "../lib/quran-reading-progress";
import { readContinueReading, writeContinueReading } from "../lib/quran-continue-reading";

export type { QuranReadingModeId, QuranReadingProgressV1, QuranSelectedRangeV1, QuranBookmarkV1 };

export { ayahKey };

export async function getQuranReadingProgress(): Promise<QuranReadingProgressV1> {
  return readQuranReadingProgressV1();
}

export async function mergeReadingProgress(
  patch: Partial<
    Pick<
      QuranReadingProgressV1,
      "readingMode" | "lastSurah" | "lastAyah" | "lastJuz" | "selectedRange" | "bookmarks"
    >
  >,
): Promise<QuranReadingProgressV1> {
  const prev = await readQuranReadingProgressV1();
  const next: QuranReadingProgressV1 = {
    ...prev,
    readingMode: patch.readingMode !== undefined ? patch.readingMode : prev.readingMode,
    lastSurah: patch.lastSurah !== undefined ? patch.lastSurah : prev.lastSurah,
    lastAyah: patch.lastAyah !== undefined ? patch.lastAyah : prev.lastAyah,
    lastJuz: patch.lastJuz !== undefined ? patch.lastJuz : prev.lastJuz,
    selectedRange: patch.selectedRange !== undefined ? patch.selectedRange : prev.selectedRange,
    bookmarks: patch.bookmarks !== undefined ? patch.bookmarks : (prev.bookmarks ?? []),
    schemaVersion: 1,
    updatedAt: Date.now(),
  };
  await writeQuranReadingProgressV1(next);
  return next;
}

export async function recordReadingPosition(
  surahId: number,
  ayah: number,
  juzApprox?: number | null,
): Promise<void> {
  const prev = await readQuranReadingProgressV1();
  await writeQuranReadingProgressV1({
    ...prev,
    lastSurah: Math.trunc(surahId),
    lastAyah: Math.trunc(ayah),
    lastJuz:
      juzApprox != null && Number.isFinite(juzApprox)
        ? Math.trunc(juzApprox)
        : prev.lastJuz,
    schemaVersion: 1,
    updatedAt: Date.now(),
  });
  await writeContinueReading({ surahId: Math.trunc(surahId), ayah: Math.trunc(ayah) });
}

export async function persistHubSelection(args: {
  mode: QuranReadingModeId | null;
  selectedRange: QuranSelectedRangeV1 | null;
}): Promise<void> {
  await mergeReadingProgress({
    readingMode: args.mode,
    selectedRange: args.selectedRange,
  });
}

export async function resolveContinueReadingPosition(): Promise<{
  surahId: number;
  ayah: number;
} | null> {
  const p = await readQuranReadingProgressV1();
  if (p.lastSurah != null && p.lastAyah != null) {
    return { surahId: p.lastSurah, ayah: p.lastAyah };
  }
  const c = await readContinueReading();
  return c ? { surahId: c.surahId, ayah: c.ayah } : null;
}

export async function addQuranBookmark(surahId: number, ayah: number, note?: string): Promise<QuranBookmarkV1> {
  const prev = await readQuranReadingProgressV1();
  const id = `${Date.now()}-${surahId}-${ayah}`;
  const row: QuranBookmarkV1 = {
    id,
    surahId: Math.trunc(surahId),
    ayah: Math.trunc(ayah),
    createdAt: Date.now(),
    note,
  };
  const rest = (prev.bookmarks ?? []).filter((b) => !(b.surahId === row.surahId && b.ayah === row.ayah));
  await mergeReadingProgress({ bookmarks: [row, ...rest] });
  return row;
}

export async function removeQuranBookmarkForAyah(surahId: number, ayah: number): Promise<void> {
  const prev = await readQuranReadingProgressV1();
  const bookmarks = (prev.bookmarks ?? []).filter(
    (b) => !(b.surahId === surahId && b.ayah === ayah),
  );
  await mergeReadingProgress({ bookmarks });
}
