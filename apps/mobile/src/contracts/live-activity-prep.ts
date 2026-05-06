/**
 * M5B scaffolding for ActivityKit / Dynamic Island / lockscreen live activities.
 *
 * Real iOS integration needs:
 * - Native target (WidgetKit + ActivityKit)
 * - Shared App Group (`group.com…`) and `UserDefaults(suiteName:)`
 * - Push-to-start / update tokens if using remote refresh
 *
 * The app only materializes these plain objects + JSON alongside the widget snapshot
 * so Swift can adopt them without reshaping JS logic.
 */

export type LiveActivityPrayerCountdownV1 = {
  schemaVersion: 1;
  surface: "live_activity";
  kind: "next_prayer_countdown";
  nextPrayerName: string;
  nextAtEpochMs: number | null;
  locationLabel: string;
  hijriLabel: string | null;
  countdownLabel: string;
  isRamadanApprox: boolean;
};

export type LiveActivityPrayerWindowV1 = {
  schemaVersion: 1;
  surface: "live_activity";
  kind: "within_prayer_window";
  currentPrayerLabel: string | null;
  /** Next after current window (for “then …” copy in native). */
  nextPrayerName: string;
  nextAtEpochMs: number | null;
  locationLabel: string;
};

export type LiveActivityRamadanHintV1 = {
  schemaVersion: 1;
  surface: "live_activity";
  kind: "ramadan_context";
  hijriLabel: string | null;
  ramadanDayApprox: number | null;
  gentleLine: string;
};

export type LiveActivityPlaceholderUnionV1 =
  | LiveActivityPrayerCountdownV1
  | LiveActivityPrayerWindowV1
  | LiveActivityRamadanHintV1;
