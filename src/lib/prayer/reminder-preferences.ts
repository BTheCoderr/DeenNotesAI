/**
 * Local-first prayer reminder preferences (web now; same contract for Expo later).
 */

import type { PrayerName, PrayerTodayPayload } from "./types";

import { prayerTimingToEpochMs } from "./timing-compute";

export const PRAYER_REMINDER_PREFS_LS_KEY = "deennotes.prayer.reminders.v1";

/** Legacy draft key — used only for one-time migration into `PRAYER_REMINDER_PREFS_LS_KEY`. */
const LEGACY_NOTIFICATION_DRAFT_KEY = "deennotes.prayer.notification_prefs.v1";

export type ReminderLeadMinutes = 0 | 5 | 10 | 15 | 30;

export const REMINDER_LEAD_OPTIONS: { value: ReminderLeadMinutes; label: string }[] = [
  { value: 0, label: "At prayer time" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
];

export type ObligatoryPrayerReminderKey = Exclude<PrayerName, "Sunrise">;

export type PrayerReminderPreferences = {
  version: 1;
  /** Master switch for in-app strip and future native scheduling. */
  quietRemindersEnabled: boolean;
  /** Optional OS/browser banner when supported (no push server). */
  browserAlertsEnabled: boolean;
  /** Minutes before each enabled salah (and Jumu’ah anchor) to surface a nudge. */
  leadMinutes: ReminderLeadMinutes;
  prayers: Record<ObligatoryPrayerReminderKey, boolean>;
  jumuah: boolean;
  ramadanSuhoor: boolean;
  ramadanIftar: boolean;
};

export const DEFAULT_PRAYER_REMINDER_PREFS: PrayerReminderPreferences = {
  version: 1,
  quietRemindersEnabled: false,
  browserAlertsEnabled: false,
  leadMinutes: 10,
  prayers: {
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  },
  jumuah: false,
  ramadanSuhoor: false,
  ramadanIftar: false,
};

function migrateFromLegacyDraft(): PrayerReminderPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_NOTIFICATION_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    const master = Boolean(o.masterEnabled);
    return {
      ...DEFAULT_PRAYER_REMINDER_PREFS,
      quietRemindersEnabled: master,
      prayers: {
        Fajr: Boolean(o.fajr),
        Dhuhr: false,
        Asr: false,
        Maghrib: Boolean(o.maghrib),
        Isha: false,
      },
      jumuah: Boolean(o.jumuah),
      ramadanSuhoor: false,
      ramadanIftar: Boolean(o.maghribIftar),
      browserAlertsEnabled: false,
    };
  } catch {
    return null;
  }
}

function normalizePrefs(raw: unknown): PrayerReminderPreferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PRAYER_REMINDER_PREFS };
  const o = raw as Record<string, unknown>;
  const lead = Number(o.leadMinutes);
  const allowed: ReminderLeadMinutes[] = [0, 5, 10, 15, 30];
  const leadMinutes = (allowed.includes(lead as ReminderLeadMinutes)
    ? lead
    : DEFAULT_PRAYER_REMINDER_PREFS.leadMinutes) as ReminderLeadMinutes;
  const p = (o.prayers && typeof o.prayers === "object" ? o.prayers : {}) as Record<
    string,
    unknown
  >;
  return {
    version: 1,
    quietRemindersEnabled: Boolean(o.quietRemindersEnabled),
    browserAlertsEnabled: Boolean(o.browserAlertsEnabled),
    leadMinutes,
    prayers: {
      Fajr: Boolean(p.Fajr),
      Dhuhr: Boolean(p.Dhuhr),
      Asr: Boolean(p.Asr),
      Maghrib: Boolean(p.Maghrib),
      Isha: Boolean(p.Isha),
    },
    jumuah: Boolean(o.jumuah),
    ramadanSuhoor: Boolean(o.ramadanSuhoor),
    ramadanIftar: Boolean(o.ramadanIftar),
  };
}

export function readPrayerReminderPreferences(): PrayerReminderPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PRAYER_REMINDER_PREFS };
  try {
    const raw = localStorage.getItem(PRAYER_REMINDER_PREFS_LS_KEY);
    if (!raw) {
      const migrated = migrateFromLegacyDraft();
      if (migrated) {
        writePrayerReminderPreferences(migrated);
        return migrated;
      }
      return { ...DEFAULT_PRAYER_REMINDER_PREFS };
    }
    return normalizePrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PRAYER_REMINDER_PREFS };
  }
}

export function writePrayerReminderPreferences(next: PrayerReminderPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      PRAYER_REMINDER_PREFS_LS_KEY,
      JSON.stringify({
        ...next,
        version: 1,
        leadMinutes: next.leadMinutes as number,
      }),
    );
  } catch {
    /* quota */
  }
}

function prayerEnabled(
  prefs: PrayerReminderPreferences,
  name: ObligatoryPrayerReminderKey,
): boolean {
  return prefs.quietRemindersEnabled && prefs.prayers[name];
}

/**
 * One gentle line for the in-app strip. Returns null when nothing should show.
 */
export function selectInAppPrayerReminderLine(opts: {
  nowMs: number;
  prefs: PrayerReminderPreferences;
  today: PrayerTodayPayload;
}): string | null {
  const { nowMs, prefs, today } = opts;
  if (!prefs.quietRemindersEnabled || !today?.ok) return null;

  const iso = today.timingsIso ?? {};
  const { timings, schedule } = today;
  const tMs = (n: ObligatoryPrayerReminderKey) => prayerTimingToEpochMs(iso[n], timings[n]);

  type Cand = { priority: number; text: string };
  const c: Cand[] = [];

  const nextName = schedule.nextPrayer as ObligatoryPrayerReminderKey;
  const nextAt = schedule.nextAtEpochMs;

  /* —— Ramadan: iftar (Maghrib) —— */
  if (today.isRamadanDay && prefs.ramadanIftar) {
    const mag = tMs("Maghrib");
    if (mag !== null && nowMs < mag + 4 * 60_000) {
      const delta = mag - nowMs;
      if (delta > 90_000 && prefs.leadMinutes > 0) {
        const leadMs = prefs.leadMinutes * 60_000;
        if (delta <= leadMs) {
          const mins = Math.max(1, Math.ceil(delta / 60_000));
          c.push({
            priority: 88,
            text: `Iftar draws near in ${mins} minute${mins === 1 ? "" : "s"}`,
          });
        }
      } else if (delta > 0 && delta <= 90_000) {
        c.push({ priority: 96, text: "A quiet moment before iftar" });
      } else if (delta <= 0 && delta > -3 * 60_000) {
        c.push({ priority: 94, text: "Maghrib has arrived — ease into iftar" });
      }
    }
  }

  /* —— Ramadan: suhoor (Fajr boundary) —— */
  if (today.isRamadanDay && prefs.ramadanSuhoor) {
    const fj = tMs("Fajr");
    if (fj !== null && nowMs < fj && nowMs > fj - 3 * 60 * 60_000) {
      const delta = fj - nowMs;
      if (prefs.leadMinutes > 0) {
        const leadMs = prefs.leadMinutes * 60_000;
        if (delta <= leadMs && delta > 90_000) {
          const mins = Math.max(1, Math.ceil(delta / 60_000));
          c.push({
            priority: 86,
            text: `Suhoor winds down in about ${mins} minute${mins === 1 ? "" : "s"}`,
          });
        }
      }
      if (delta <= 5 * 60_000 && delta > 0) {
        c.push({ priority: 84, text: "Fajr begins soon — take suhoor gently" });
      }
    }
  }

  /* —— Imminent next salah —— */
  if (nextAt !== null && Number.isFinite(nextAt) && prayerEnabled(prefs, nextName)) {
    const late = nowMs - nextAt;
    const early = nextAt - nowMs;
    if (late >= 0 && late <= 4 * 60_000) {
      c.push({ priority: 98, text: `Time for ${nextName}` });
    } else if (early > 0 && early <= 90_000) {
      c.push({ priority: 97, text: `Time for ${nextName}` });
    } else if (early > 0 && early <= 5 * 60_000 && nextName === "Fajr" && prayerEnabled(prefs, "Fajr")) {
      c.push({ priority: 83, text: "Fajr begins soon" });
    }

    /* —— Countdown —— */
    if (prefs.leadMinutes > 0 && early > 90_000) {
      const leadMs = prefs.leadMinutes * 60_000;
      if (early <= leadMs) {
        const mins = Math.max(1, Math.ceil(early / 60_000));
        const isJumuContext =
          prefs.jumuah &&
          new Date(nowMs).getDay() === 5 &&
          nextName === "Dhuhr";

        let text =
          nextName === "Maghrib"
            ? `Maghrib is in ${mins} minute${mins === 1 ? "" : "s"}`
            : `${nextName} is in ${mins} minute${mins === 1 ? "" : "s"}`;
        if (isJumuContext) text = `${text} · Jumu’ah`;

        c.push({ priority: 72, text });
      }
    }

    /* —— At prayer time lead = 0: soft bracket —— */
    if (
      prefs.leadMinutes === 0 &&
      early > 0 &&
      early <= 2 * 60_000 &&
      !(today.isRamadanDay && prefs.ramadanIftar && nextName === "Maghrib")
    ) {
      c.push({ priority: 90, text: `${nextName} begins in a breath` });
    }
  }

  /* —— Jumu’ah ambient (Friday morning, before thinning window) —— */
  if (prefs.jumuah && new Date(nowMs).getDay() === 5) {
    const dhuhr = tMs("Dhuhr");
    const morning = new Date(nowMs);
    morning.setHours(5, 0, 0, 0);
    if (dhuhr !== null && nowMs < dhuhr - 10 * 60_000 && nowMs > morning.getTime()) {
      c.push({ priority: 22, text: "Jumu’ah reminder today" });
    }
  }

  if (!c.length) return null;
  c.sort((a, b) => b.priority - a.priority);
  return c[0].text;
}
