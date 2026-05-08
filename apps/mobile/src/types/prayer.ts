/**
 * Prayer-facing types for services/UI (canonical shapes live in `src/api/types.ts`).
 */

export type {
  PrayerName,
  PrayerTodayPayload,
  PrayerScheduleDto,
} from "../api/types";

export type NextPrayerSummary = {
  name: string;
  countdownMs: number | null;
  countdownShort: string;
};

export type PrayerRow = {
  name: string;
  time: string;
  iso?: string | null;
};
