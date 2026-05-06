/**
 * In-app + future iOS widget toggles (no native widget binary in this drop).
 */
export type WidgetPreferencesV1 = {
  schemaVersion: 1;
  /** Master: when false, previews still work but snapshot omits glance fields. */
  enabled: boolean;
  showNextPrayer: boolean;
  showCountdown: boolean;
  showHijri: boolean;
  showDailyAyah: boolean;
  showContinueReading: boolean;
  showReflectionReminder: boolean;
  /** Subtle DeenNotes word in small widget / glance. */
  showBranding: boolean;
};

export const DEFAULT_WIDGET_PREFS: WidgetPreferencesV1 = {
  schemaVersion: 1,
  enabled: true,
  showNextPrayer: true,
  showCountdown: true,
  showHijri: true,
  showDailyAyah: true,
  showContinueReading: true,
  showReflectionReminder: true,
  showBranding: true,
};
