import { bumpPrayerNotificationSchedule } from "../lib/notifications/prayer-schedule-signal";
import {
  rescheduleLocalPrayerNotifications,
  cancelPrayerReminderNotifications,
} from "../lib/notifications/prayer-scheduler";
import { readMobilePrayerLocationPrefs } from "../lib/mobile-prayer-prefs";
import { readMobileReminderPrefs } from "../lib/prayer-reminder-storage";
import { getNotificationPermissionStatus } from "../lib/notifications/permissions";
import { fetchPrayerToday } from "../api/prayer";
import { prayerTodayQueryFromPrefs } from "../lib/prayer-query";
import type { PrayerTodayPayload } from "../api/types";

export { cancelPrayerReminderNotifications as cancelPrayerNotifications };

/** Nudges {@link rescheduleLocalPrayerNotifications} via app effects (preferred path). */
export function schedulePrayerNotifications(): void {
  bumpPrayerNotificationSchedule();
}

/**
 * Immediately rebuilds salah notifications when you already hold today&apos;s payload
 * (e.g. settings save). Falls back silently if prerequisites are missing.
 */
export async function schedulePrayerNotificationsNow(today: PrayerTodayPayload): Promise<void> {
  try {
    const [prefs, reminder, granted] = await Promise.all([
      readMobilePrayerLocationPrefs(),
      readMobileReminderPrefs(),
      getNotificationPermissionStatus(),
    ]);
    await rescheduleLocalPrayerNotifications({
      today,
      prefs,
      reminder,
      permissionGranted: granted === "granted",
    });
  } catch {
    /* non-fatal — user still has in-app times */
  }
}

/** Loads today silently for notification bootstrap (never throws). */
export async function loadTodayForScheduling(): Promise<PrayerTodayPayload | null> {
  try {
    const stored = await readMobilePrayerLocationPrefs();
    const q = prayerTodayQueryFromPrefs(stored);
    const res = await fetchPrayerToday(q);
    return res && "ok" in res && res.ok ? res : null;
  } catch {
    return null;
  }
}
