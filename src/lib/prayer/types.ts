/** Client-safe prayer metadata (coordinates never exposed publicly). */

export type PrayerName =
  | "Fajr"
  | "Sunrise"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

/** User-selectable methods per AlAdhan v1 table (see calculation-methods on aladhan.com). */
export const CALCULATION_METHOD_OPTIONS: { id: number; label: string }[] = [
  { id: 3, label: "Muslim World League" },
  { id: 2, label: "Islamic Society of North America (ISNA)" },
  { id: 4, label: "Umm Al-Qura, Makkah" },
  { id: 5, label: "Egyptian General Authority of Survey" },
  { id: 1, label: "University of Islamic Sciences, Karachi" },
  { id: 15, label: "Moonsighting Committee Worldwide" },
  { id: 16, label: "Dubai (unofficial)" },
  { id: 10, label: "Qatar" },
  { id: 13, label: "Diyanet (Turkey)" },
  { id: 7, label: "Institute of Geophysics, Tehran" },
];

export const MADHAB_OPTIONS: { id: 0 | 1; label: string }[] = [
  { id: 0, label: "Shāfi‘ī (standard)" },
  { id: 1, label: "Hanafi" },
];

/** @deprecated use CALCULATION_METHOD_OPTIONS */
export const PRAYER_METHOD_OPTIONS = CALCULATION_METHOD_OPTIONS;

/** @deprecated use MADHAB_OPTIONS */
export const ASR_SCHOOL_OPTIONS = MADHAB_OPTIONS;

const ALLOWED_METHOD_IDS = new Set(CALCULATION_METHOD_OPTIONS.map((m) => m.id));

export function coerceCalculationMethod(id: unknown): number {
  const n = typeof id === "number" ? id : Number(id);
  if (Number.isFinite(n)) {
    const t = Math.trunc(n);
    if (ALLOWED_METHOD_IDS.has(t)) return t;
    if (t === 11) return 15;
  }
  return 2;
}

export type PrayerTimingsPayload = {
  ok: true;
  /** City / region label only — never precise coordinates. */
  locationLabel: string;
  gregorianDateReadable: string;
  hijriLabel: string;
  hijriMonthName?: string;
  hijriDay?: string;
  hijriMonthNum?: number;
  hijriYear?: string;
  /** IANA TZ when provided by upstream (safe to show). Never lat/lng. */
  timezone?: string;
  methodLabel: string;
  schoolLabel: string;
  timings: Record<PrayerName, string>;
  /** When requested — ISO8601 instants suitable for countdowns worldwide. */
  timingsIso?: Partial<Record<PrayerName, string>>;
};

export type PrayerScheduleDto = {
  currentPrayer: PrayerName | null;
  /** Gentle UX line, e.g. "Since Maghrib" or "Before Fajr" */
  currentLabel: string;
  nextPrayer: PrayerName;
  nextAtIso: string | null;
  nextAtEpochMs: number | null;
};

export type PrayerTodayPayload = PrayerTimingsPayload & {
  schedule: PrayerScheduleDto;
  /** True during Hijri Ramaḍān for this locality’s reported calendar day */
  isRamadanDay?: boolean;
  ramadanDay?: number | null;
};

export type PrayerTimingsError = {
  ok: false;
  error: string;
  code?: "UPSTREAM" | "INVALID" | "RATE";
};

export type PrayerTimesResponse = PrayerTimingsPayload | PrayerTimingsError;
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

export type PrayerHijriCalendarPayload = {
  ok: true;
  locationLabel: string;
  hijriYear: number;
  hijriMonth: number;
  gregorianMirrorYear?: number;
  gregorianMirrorMonth?: number;
  days: PrayerCalendarDayDto[];
};

export type ScaffoldIslamicDay = {
  key: string;
  hijriApproxMonth: number;
  hijriApproxDay: number;
  labelEn: string;
  note?: string;
};

/** Non-exhaustive markers for calendar scaffolding (local sighting varies). */
export const HIJRI_SCAFFOLD_DAYS: ScaffoldIslamicDay[] = [
  { key: "ramadan-start", hijriApproxMonth: 9, hijriApproxDay: 1, labelEn: "Ramadan begins (calendar)" },
  { key: "laylat-al-qadr", hijriApproxMonth: 9, hijriApproxDay: 27, labelEn: "Laylat al-Qadr (seek nights 21–29)", note: "Many communities emphasize the last odd nights." },
  { key: "eid-fitr", hijriApproxMonth: 10, hijriApproxDay: 1, labelEn: "Eid al-Fitr (approx.)" },
  { key: "arafah", hijriApproxMonth: 12, hijriApproxDay: 9, labelEn: "Day of ‘Arafah (approx.)" },
  { key: "eid-adha", hijriApproxMonth: 12, hijriApproxDay: 10, labelEn: "Eid al-Adha (approx.)" },
];
