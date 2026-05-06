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
