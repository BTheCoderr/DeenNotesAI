import type { QueryClient } from "@tanstack/react-query";

import type { PrayerName, PrayerTodayPayload } from "../api/types";
import { prayerTodayQueryKey } from "../api/hooks/usePrayerToday";
import type { NextPrayerSummary, PrayerRow } from "../types/prayer";
import { bumpPrayerNotificationSchedule } from "../lib/notifications/prayer-schedule-signal";

export {
  cancelPrayerNotifications,
  schedulePrayerNotifications,
  schedulePrayerNotificationsNow,
} from "./notificationService";

const FIVE: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

/** Human “1h 24m” style for next-prayer widgets. */
export function formatNextPrayerCountdown(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  if (ms <= 0) return "now";
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m < 1) return "<1m";
  return `${m}m`;
}

export function getPrayerTimes(data: PrayerTodayPayload): PrayerRow[] {
  return FIVE.map((name) => ({
    name,
    time: data.timings[name],
    iso: data.timingsIso?.[name] ?? null,
  }));
}

export function getNextPrayer(data: PrayerTodayPayload): NextPrayerSummary {
  const ms =
    data.schedule.nextAtEpochMs != null ? data.schedule.nextAtEpochMs - Date.now() : null;
  return {
    name: data.schedule.nextPrayer,
    countdownMs: ms,
    countdownShort: formatNextPrayerCountdown(ms),
  };
}

/** Minute + second detail (e.g. hero tiles). Re-export helper name for parity with UI copy. */
export { formatCountdown } from "../lib/format-time";

/** Soft refresh: invalidates cached today payload + nudges local notification reschedule. */
export async function refreshPrayerTimes(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: prayerTodayQueryKey });
  bumpPrayerNotificationSchedule();
}
