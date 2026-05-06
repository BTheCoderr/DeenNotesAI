/**
 * Mirrors client-safe types from web `src/lib/prayer/types.ts` and `src/lib/quran/types.ts`
 * without importing server-only modules.
 */

export type PrayerName =
  | "Fajr"
  | "Sunrise"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

export type PrayerTimingsPayload = {
  ok: true;
  locationLabel: string;
  gregorianDateReadable: string;
  hijriLabel: string;
  hijriMonthName?: string;
  hijriDay?: string;
  hijriMonthNum?: number;
  hijriYear?: string;
  timezone?: string;
  methodLabel: string;
  schoolLabel: string;
  timings: Record<PrayerName, string>;
  timingsIso?: Partial<Record<PrayerName, string>>;
};

export type PrayerScheduleDto = {
  currentPrayer: PrayerName | null;
  currentLabel: string;
  nextPrayer: PrayerName;
  nextAtIso: string | null;
  nextAtEpochMs: number | null;
};

export type PrayerTodayPayload = PrayerTimingsPayload & {
  schedule: PrayerScheduleDto;
  isRamadanDay?: boolean;
  ramadanDay?: number | null;
};

export type PrayerTimingsError = {
  ok: false;
  error: string;
  code?: "UPSTREAM" | "INVALID" | "RATE";
};

export type PrayerTodayResponse = PrayerTodayPayload | PrayerTimingsError;

export type PrayerCalendarDayDto = {
  gregorianReadable: string;
  hijriLabel: string;
  hijriMonthNum?: number;
  hijriDay?: number;
  hijriYear?: string;
  timings: Record<PrayerName, string>;
  timingsIso?: Partial<Record<PrayerName, string>>;
  hijriHolidays?: string[];
};

export type PrayerCalendarPayload = {
  ok: true;
  locationLabel: string;
  year: number;
  month: number;
  timezone?: string;
  days: PrayerCalendarDayDto[];
};

export type PrayerRamadanOk = {
  ok: true;
  hijriYear: number;
  gregorianMonth: number | null;
  gregorianYear: number | null;
  hijriRamadan: {
    hijriStartMonth?: number;
    hijriStartDay?: number;
    hijriEndMonth?: number;
    hijriEndDay?: number;
    gregorianStart?: string;
    gregorianEnd?: string;
  } | null;
  gregorianOverlap: {
    month?: number;
    year?: number;
    [k: string]: unknown;
  } | null;
};

export type PrayerRamadanResponse =
  | PrayerRamadanOk
  | { ok: false; error: string; code?: string };

export type Chapter = {
  id: number;
  versesCount: number;
  revelationPlace: string;
  revelationOrder?: number;
  nameSimple: string;
  nameArabic: string;
  translatedName?: string;
  transliteratedName?: string;
};

export type ChaptersResponse = { chapters: Chapter[] };

/** Mirrors web `VerseDto` shape returned by `/api/quran/chapters/[id]/verses`. */
export type VerseTranslationDto = {
  text: string;
  resourceId?: number;
  resourceName?: string;
  languageName?: string;
};

export type VerseDto = {
  id: number;
  verseNumber: number;
  verseKey: string;
  chapterId: number;
  textUthmani: string;
  textImlaei?: string;
  translations: VerseTranslationDto[];
  tafsirs?: { text: string; resourceId?: number; resourceName?: string }[];
};

export type ChapterVersesResponse = { verses: VerseDto[] };

export type VerseAudioApiResponse = {
  verseKey: string;
  reciterId: string;
  audioUrl: string;
  format?: string;
};

export type RecitationResourceDto = {
  id: number;
  reciterName?: string;
  style?: string;
  translatedName?: string;
};

export type RecitationsListResponse = { recitations: RecitationResourceDto[] };

export type QuranPublicApiMeta = {
  servingMode: string;
  offlineReflectionDataset: boolean;
};

/** Strips `_quran` envelope from `/api/quran/*` JSON (same as web `splitQuranApiJson`). */
export function splitQuranApiJson<T extends Record<string, unknown>>(
  raw: unknown,
): { data: T; meta: QuranPublicApiMeta | null } {
  if (!raw || typeof raw !== "object") {
    return { data: {} as T, meta: null };
  }
  const o = raw as Record<string, unknown>;
  const metaRaw = o._quran;
  const meta =
    metaRaw &&
    typeof metaRaw === "object" &&
    typeof (metaRaw as QuranPublicApiMeta).servingMode === "string"
      ? (metaRaw as QuranPublicApiMeta)
      : null;
  const { _quran: _drop, ...rest } = o;
  void _drop;
  return { data: rest as T, meta };
}
