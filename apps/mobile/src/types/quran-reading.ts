/**
 * Quran reading progress (device-local; schema friendly for future sync).
 */

export type QuranReadingModeId =
  | "continueReading"
  | "singleAyah"
  | "ayahRange"
  | "fullSurah"
  | "juz"
  | "fullQuran";

export type QuranSelectedRangeV1 = {
  surahId: number;
  startAyah: number;
  endAyah: number;
};

export type QuranBookmarkV1 = {
  id: string;
  surahId: number;
  ayah: number;
  createdAt: number;
  note?: string;
};

export type QuranReadingProgressV1 = {
  schemaVersion: 1;
  readingMode: QuranReadingModeId | null;
  lastSurah: number | null;
  lastAyah: number | null;
  lastJuz: number | null;
  selectedRange: QuranSelectedRangeV1 | null;
  updatedAt: number;
  bookmarks?: QuranBookmarkV1[];
};

export function ayahKey(surahId: number, ayah: number): string {
  return `${Math.trunc(surahId)}:${Math.trunc(ayah)}`;
}
