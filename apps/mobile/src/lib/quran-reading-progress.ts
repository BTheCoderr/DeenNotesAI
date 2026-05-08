import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  QuranBookmarkV1,
  QuranReadingModeId,
  QuranReadingProgressV1,
  QuranSelectedRangeV1,
} from "../types/quran-reading";

/** Versioned Qur’an reading persistence (mobile). */
export const QURAN_READING_PROGRESS_STORAGE_KEY =
  "deennotes.mobile.quran.readingProgress.v1" as const;

const LEGACY_V2_KEY = "deennotes.mobile.quran.readingProgress.v2";

const EMPTY: QuranReadingProgressV1 = {
  schemaVersion: 1,
  readingMode: null,
  lastSurah: null,
  lastAyah: null,
  lastJuz: null,
  selectedRange: null,
  updatedAt: 0,
  bookmarks: [],
};

function normalizeBookmarks(raw: unknown): QuranBookmarkV1[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (b): b is QuranBookmarkV1 =>
      b &&
      typeof b === "object" &&
      typeof (b as QuranBookmarkV1).id === "string" &&
      Number.isFinite((b as QuranBookmarkV1).surahId) &&
      Number.isFinite((b as QuranBookmarkV1).ayah) &&
      typeof (b as QuranBookmarkV1).createdAt === "number",
  );
}

/** Accepts bookmarks using legacy `number` ayah index from v2 export. */
function coerceBookmarkLoose(raw: Record<string, unknown>): QuranBookmarkV1 | null {
  const surahId = Number(raw.surahId);
  const ayah =
    typeof raw.ayah === "number"
      ? raw.ayah
      : typeof raw.number === "number"
        ? raw.number
        : Number(raw.ayah ?? raw.number);
  if (!Number.isFinite(surahId) || !Number.isFinite(ayah)) return null;
  const id = typeof raw.id === "string" ? raw.id : `${Date.now()}-${surahId}-${ayah}`;
  const createdAt = typeof raw.createdAt === "number" ? raw.createdAt : Date.now();
  const note = typeof raw.note === "string" ? raw.note : undefined;
  return {
    id,
    surahId: Math.trunc(surahId),
    ayah: Math.trunc(ayah),
    createdAt,
    note,
  };
}

function normalizeSelectedRange(raw: unknown): QuranSelectedRangeV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sid = Number(o.surahId);
  const start = Number(o.startAyah);
  const end = Number(o.endAyah);
  if (!Number.isFinite(sid) || !Number.isFinite(start) || !Number.isFinite(end)) return null;
  return {
    surahId: Math.trunc(sid),
    startAyah: Math.max(1, Math.trunc(start)),
    endAyah: Math.max(1, Math.trunc(end)),
  };
}

const MODE_IDS = new Set<string>([
  "continueReading",
  "singleAyah",
  "ayahRange",
  "fullSurah",
  "juz",
  "fullQuran",
]);

export function normalizeQuranReadingProgressV1(
  raw: Partial<QuranReadingProgressV1> | Record<string, unknown> | null | undefined,
): QuranReadingProgressV1 {
  if (!raw || typeof raw !== "object") return { ...EMPTY, bookmarks: [] };
  const modeRaw = raw.readingMode as string | null | undefined;
  const readingMode =
    typeof modeRaw === "string" && MODE_IDS.has(modeRaw)
      ? (modeRaw as QuranReadingModeId)
      : null;
  let bookmarks = normalizeBookmarks(raw.bookmarks);

  /** v2 blob used `number` instead of `ayah` on bookmarks. */
  if (!bookmarks.length && Array.isArray((raw as { bookmarks?: unknown }).bookmarks)) {
    const loose = (raw as { bookmarks: unknown[] }).bookmarks
      .map((x) => (x && typeof x === "object" ? coerceBookmarkLoose(x as Record<string, unknown>) : null))
      .filter((x): x is QuranBookmarkV1 => Boolean(x));
    bookmarks = loose;
  }

  return {
    schemaVersion: 1,
    readingMode,
    lastSurah: Number.isFinite(raw.lastSurah as number) ? Math.trunc(raw.lastSurah as number) : null,
    lastAyah: Number.isFinite(raw.lastAyah as number) ? Math.trunc(raw.lastAyah as number) : null,
    lastJuz: Number.isFinite(raw.lastJuz as number) ? Math.trunc(raw.lastJuz as number) : null,
    selectedRange: normalizeSelectedRange(raw.selectedRange),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    bookmarks,
  };
}

function migrateLegacyV2Json(parsed: Record<string, unknown>): QuranReadingProgressV1 {
  const mode = typeof parsed.readingMode === "string" && MODE_IDS.has(parsed.readingMode)
    ? (parsed.readingMode as QuranReadingModeId)
    : null;
  const session = parsed.activeSession as Record<string, unknown> | null | undefined;
  let selectedRange: QuranSelectedRangeV1 | null = null;
  if (session && typeof session === "object") {
    const sid = Number(session.surahId);
    const a0 = Number(session.ayahStart);
    const a1 = Number(session.ayahEnd);
    if (Number.isFinite(sid) && Number.isFinite(a0)) {
      const end = Number.isFinite(a1) ? Math.max(a0, a1) : a0;
      selectedRange = {
        surahId: Math.trunc(sid),
        startAyah: Math.max(1, Math.trunc(a0)),
        endAyah: Math.max(1, Math.trunc(end)),
      };
    }
  }
  const bookmarksRaw = Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [];
  const bookmarks = bookmarksRaw
    .map((x) => (x && typeof x === "object" ? coerceBookmarkLoose(x as Record<string, unknown>) : null))
    .filter((x): x is QuranBookmarkV1 => Boolean(x));

  return normalizeQuranReadingProgressV1({
    schemaVersion: 1,
    readingMode: mode,
    lastSurah: Number.isFinite(parsed.lastSurah as number) ? Math.trunc(parsed.lastSurah as number) : null,
    lastAyah: Number.isFinite(parsed.lastAyah as number) ? Math.trunc(parsed.lastAyah as number) : null,
    lastJuz: Number.isFinite(parsed.lastJuz as number) ? Math.trunc(parsed.lastJuz as number) : null,
    selectedRange,
    updatedAt: typeof parsed.updatedAt === "number" ? (parsed.updatedAt as number) : Date.now(),
    bookmarks,
  });
}

export async function readQuranReadingProgressV1(): Promise<QuranReadingProgressV1> {
  try {
    const rawV1 = await AsyncStorage.getItem(QURAN_READING_PROGRESS_STORAGE_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1) as Record<string, unknown>;
      return normalizeQuranReadingProgressV1(parsed);
    }
    const rawV2 = await AsyncStorage.getItem(LEGACY_V2_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Record<string, unknown>;
      const migrated = migrateLegacyV2Json(parsed);
      await writeQuranReadingProgressV1(migrated);
      await AsyncStorage.removeItem(LEGACY_V2_KEY);
      return migrated;
    }
  } catch {
    /* fall through */
  }
  return { ...EMPTY, bookmarks: [] };
}

export async function writeQuranReadingProgressV1(next: QuranReadingProgressV1): Promise<void> {
  const payload: QuranReadingProgressV1 = {
    ...next,
    schemaVersion: 1,
    updatedAt: Date.now(),
    bookmarks: next.bookmarks ?? [],
  };
  await AsyncStorage.setItem(QURAN_READING_PROGRESS_STORAGE_KEY, JSON.stringify(payload));
}
