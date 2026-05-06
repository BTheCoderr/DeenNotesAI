/** Serializable prayer preferences (stored on-device first — mirrors future Expo adapters). */

import { PRAYER_FALLBACK_LOCATION } from "@/lib/prayer/location";

/** Legacy draft prefs; salah reminders now use `PrayerReminderPreferences` in `./reminder-preferences`. */

export type PrayerNotificationPrefs = {
  masterEnabled: boolean;
  fajr: boolean;
  maghrib: boolean;
  jumuah: boolean;
  quranReflection: boolean;
  taraweehHint: boolean;
  maghribIftar: boolean;
};

export type RamadanPrefsStored = {
  tonightAyahReminder: boolean;
  postTarawihNotesNudge: boolean;
};

export type PrayerPrefsStored = {
  city: string;
  country: string;
  region?: string;
  method: number;
  school: 0 | 1;
  /** When true, Prayer surfaces may request coarse browser geolocation instead of city/country. */
  useBrowserLocation?: boolean;
  /** Passed to AlAdhan `adjustment` — consult local scholars if unsure */
  hijriAdjustment?: number;
  notifications?: PrayerNotificationPrefs;
  ramadan?: RamadanPrefsStored;
};

export const DEFAULT_PRAYER_PREFS: PrayerPrefsStored = {
  city: PRAYER_FALLBACK_LOCATION.city,
  country: PRAYER_FALLBACK_LOCATION.country,
  region: PRAYER_FALLBACK_LOCATION.region,
  method: 2,
  school: 0,
  hijriAdjustment: 0,
  ramadan: {
    tonightAyahReminder: true,
    postTarawihNotesNudge: false,
  },
};
