export const PRAYER_REMINDER_PRAYERS = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const;

export const PRAYER_SPECIAL_REMINDERS = ["jumuah", "suhoor", "iftar"] as const;

export const REMINDER_OFFSETS_MINUTES = [0, 5, 10, 15, 30] as const;

export type PrayerReminderPrayerName = (typeof PRAYER_REMINDER_PRAYERS)[number];
export type PrayerSpecialReminderName = (typeof PRAYER_SPECIAL_REMINDERS)[number];
export type ReminderOffsetMinutes = (typeof REMINDER_OFFSETS_MINUTES)[number];

export const PRAYER_CALCULATION_METHODS = [
  "MWL",
  "ISNA",
  "UmmAlQura",
  "Karachi",
  "Egyptian",
  "Moonsighting",
  "Dubai",
  "Qatar",
  "Turkey",
  "Tehran",
] as const;

export const PRAYER_MADHABS = ["Shafi", "Hanafi"] as const;

export type PrayerCalculationMethod = (typeof PRAYER_CALCULATION_METHODS)[number];
export type PrayerMadhab = (typeof PRAYER_MADHABS)[number];

export const LOCATION_FALLBACK = {
  city: "Providence",
  region: "Rhode Island",
  country: "United States",
  latitude: 41.824,
  longitude: -71.4128,
} as const;
