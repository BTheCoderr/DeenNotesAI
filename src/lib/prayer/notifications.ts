/**
 * Prayer reminder scaffolding: legacy draft prefs + Expo-ready scheduler contract.
 */

import type { PrayerNotificationPrefs } from "./prefs-shape";
import type { ObligatoryPrayerReminderKey, PrayerReminderPreferences } from "./reminder-preferences";
import type { PrayerTodayPayload } from "./types";
import { prayerTimingToEpochMs } from "./timing-compute";

/** @deprecated Prefer `PRAYER_REMINDER_PREFS_LS_KEY` in `./reminder-preferences`. */

export const PRAYER_NOTIFICATION_PREFS_LS_KEY =
  "deennotes.prayer.notification_prefs.v1";

export type FutureNotificationKind =
  | "fajr"
  | "maghrib"
  | "jumuah"
  | "quran_reflection";

export function defaultNotificationPrefs(): PrayerNotificationPrefs {
  return {
    masterEnabled: false,
    fajr: false,
    maghrib: false,
    jumuah: false,
    quranReflection: false,
    taraweehHint: true,
    maghribIftar: false,
  };
}

export function readNotificationPrefsDraft(): PrayerNotificationPrefs {
  if (typeof window === "undefined") return defaultNotificationPrefs();
  try {
    const raw = localStorage.getItem(PRAYER_NOTIFICATION_PREFS_LS_KEY);
    if (!raw) return defaultNotificationPrefs();
    const o = JSON.parse(raw) as Partial<PrayerNotificationPrefs>;
    return {
      ...defaultNotificationPrefs(),
      ...o,
      masterEnabled: Boolean(o.masterEnabled),
      fajr: Boolean(o.fajr),
      maghrib: Boolean(o.maghrib),
      jumuah: Boolean(o.jumuah),
      quranReflection: Boolean(o.quranReflection),
      taraweehHint: o.taraweehHint !== false,
      maghribIftar: Boolean(o.maghribIftar),
    };
  } catch {
    return defaultNotificationPrefs();
  }
}

export function writeNotificationPrefsDraft(next: PrayerNotificationPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRAYER_NOTIFICATION_PREFS_LS_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

/** Expo / native may map kinds to notification categories & actions. */

export type NativePrayerReminderKind =
  | ObligatoryPrayerReminderKey
  | "jumuah_dhuhr_anchor"
  | "ramadan_suhoor_anchor"
  | "ramadan_iftar_anchor";

/**
 * Portable batch item for `expo-notifications`, `UNNotificationRequest`, etc.
 */

export type NativePrayerReminderRequest = {
  id: string;
  kind: NativePrayerReminderKind;
  fireAtEpochMs: number;
  title: string;
  body: string;
  repeat: "none" | "daily_refresh";
};

/** Web noop; Expo implements with OS APIs. */

export interface PrayerReminderSchedulerPort {
  isSupported(): boolean;
  requestPermission(): Promise<NotificationPermission | "unsupported">;
  schedule(batch: NativePrayerReminderRequest[]): Promise<void>;
  cancel(ids: string[]): Promise<void>;
  cancelAllPrayerReminders(): Promise<void>;
}

export function createWebNoopPrayerReminderScheduler(): PrayerReminderSchedulerPort {
  return {
    isSupported: () => false,
    requestPermission: async () => "unsupported",
    schedule: async () => {},
    cancel: async () => {},
    cancelAllPrayerReminders: async () => {},
  };
}

function gregorianSlug(g: string) {
  return g.replace(/\s+/g, "_").slice(0, 32);
}

/** One-shot anchors derived from `/api/prayer/today` — reschedule on next successful fetch (mobile). */

export function buildNativePrayerReminderOutline(opts: {
  prefs: PrayerReminderPreferences;
  today: PrayerTodayPayload;
  nowMs?: number;
}): NativePrayerReminderRequest[] {
  const { prefs, today } = opts;
  const nowMs = opts.nowMs ?? Date.now();
  if (!prefs.quietRemindersEnabled || !today.ok) return [];

  const iso = today.timingsIso ?? {};
  const { timings } = today;
  const lead = prefs.leadMinutes * 60_000;
  const slug = gregorianSlug(today.gregorianDateReadable);
  const out: NativePrayerReminderRequest[] = [];

  const pushPrayer = (name: ObligatoryPrayerReminderKey, title: string) => {
    if (!prefs.prayers[name]) return;
    const instant = prayerTimingToEpochMs(iso[name], timings[name]);
    if (instant === null) return;
    const fire = instant - lead;
    if (fire < nowMs - 120_000) return;
    out.push({
      id: `deennotes.prayer.${slug}.${name}`,
      kind: name,
      fireAtEpochMs: fire,
      title,
      body: `A quiet reminder before ${name}.`,
      repeat: "none",
    });
  };

  pushPrayer("Fajr", "Fajr approaches");
  pushPrayer("Dhuhr", "Dhuhr approaches");
  pushPrayer("Asr", "Asr approaches");
  pushPrayer("Maghrib", "Maghrib approaches");
  pushPrayer("Isha", "Isha approaches");

  const dhuhrInstant = prayerTimingToEpochMs(iso.Dhuhr, timings.Dhuhr);

  if (prefs.jumuah && new Date(nowMs).getDay() === 5 && dhuhrInstant !== null) {
    const fire = dhuhrInstant - lead;
    if (fire >= nowMs - 120_000) {
      out.push({
        id: `deennotes.prayer.${slug}.jumuah`,
        kind: "jumuah_dhuhr_anchor",
        fireAtEpochMs: fire,
        title: "Jumu’ah",
        body: "A gentle pause before congregation.",
        repeat: "none",
      });
    }
  }

  if (today.isRamadanDay) {
    const fj = prayerTimingToEpochMs(iso.Fajr, timings.Fajr);
    if (prefs.ramadanSuhoor && fj !== null) {
      const fire = fj - lead;
      if (fire >= nowMs - 120_000) {
        out.push({
          id: `deennotes.prayer.${slug}.suhoor`,
          kind: "ramadan_suhoor_anchor",
          fireAtEpochMs: fire,
          title: "Suhoor window",
          body: "A calm moment before Fajr.",
          repeat: "none",
        });
      }
    }

    const mg = prayerTimingToEpochMs(iso.Maghrib, timings.Maghrib);
    if (prefs.ramadanIftar && mg !== null) {
      const fire = mg - lead;
      if (fire >= nowMs - 120_000) {
        out.push({
          id: `deennotes.prayer.${slug}.iftar`,
          kind: "ramadan_iftar_anchor",
          fireAtEpochMs: fire,
          title: "Iftar draws near",
          body: "Ease toward Maghrib without rush.",
          repeat: "none",
        });
      }
    }
  }

  return out;
}
