/**
 * Safari/Chrome timers + `Notification` where permission is granted — no push server.
 * Fires while the OS keeps the timer alive (tab may stay closed only if browser persists timers; often requires open client).
 */

import { buildNativePrayerReminderOutline } from "./notifications";

import type { PrayerReminderPreferences } from "./reminder-preferences";

import type { PrayerTodayPayload } from "./types";

const ACTIVE: number[] = [];

export function cancelWebPrayerNotificationTimers(): void {
  while (ACTIVE.length) {
    const id = ACTIVE.pop();
    if (id != null) window.clearTimeout(id);
  }
}

export function scheduleWebPrayerNotificationTimers(
  prefs: PrayerReminderPreferences,
  today: PrayerTodayPayload | null | undefined,
): void {
  cancelWebPrayerNotificationTimers();

  if (typeof window === "undefined") return;
  if (!(prefs.quietRemindersEnabled && prefs.browserAlertsEnabled)) return;
  if (!today?.ok || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = Date.now();
  const batch = buildNativePrayerReminderOutline({ prefs, today, nowMs: now });
  for (const req of batch) {
    const delay = req.fireAtEpochMs - now;
    if (delay < 1_000 || delay > 26 * 60 * 60 * 1000) continue;
    const timeoutId = window.setTimeout(() => {
      try {
        new Notification(req.title, { body: req.body, tag: req.id });
      } catch {
        /* older browsers */
      }
    }, delay);
    ACTIVE.push(timeoutId);
  }
}

export function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied");
  }
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  try {
    return Notification.requestPermission();
  } catch {
    return Promise.resolve("denied");
  }
}
