import * as Notifications from "expo-notifications";

/**
 * Placeholder categories for a future production scheduler (M4+).
 * Maps roughly to prayer preferences toggles + special times.
 */
export type PrayerReminderCategory =
  | "fajr"
  | "maghrib"
  | "jumuah"
  | "suhoor"
  | "iftar";

export type SchedulePlaceholderInput = {
  category: PrayerReminderCategory;
  /** When the notification should surface (exact wall time). */
  fireDate: Date;
  title: string;
  body: string;
};

/**
 * Schedules a single one-shot local notification. Intended for experimentation only;
 * production will batch, dedupe, and respect travel / DST via server or recalculation.
 */
export async function scheduleLocalReminderPlaceholder(
  input: SchedulePlaceholderInput,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      data: { category: input.category, scaffold: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.fireDate,
    },
  });
  return id;
}

export async function cancelAllLocalPrayerReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function listScheduledPlaceholderIds(): Promise<string[]> {
  return Notifications.getAllScheduledNotificationsAsync().then((rows) =>
    rows.map((r) => r.identifier),
  );
}
