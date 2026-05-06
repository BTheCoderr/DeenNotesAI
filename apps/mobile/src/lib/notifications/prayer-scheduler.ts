import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PrayerCalendarPayload, PrayerName, PrayerTodayPayload } from "../../api/types";
import { getPrayerCalendarMonth } from "../../api/prayer";

import type { MobilePrayerLocationPrefs } from "../mobile-prayer-prefs";
import type { MobileReminderPrefsState } from "../prayer-reminder-storage";
import { prayerTodayQueryFromPrefs } from "../prayer-query";

import { prayerTimingToEpochMs } from "../prayer/timing-compute";

const ANDROID_CHANNEL = "deen-prayer-calm";

let channelReady = false;

export async function ensureAndroidPrayerChannel(): Promise<void> {
  if (Platform.OS !== "android" || channelReady) return;
  channelReady = true;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: "Prayer (calm)",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [],
    bypassDnd: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function cancelPrayerReminderNotifications(): Promise<void> {
  const rows = await Notifications.getAllScheduledNotificationsAsync();
  for (const r of rows) {
    const d = r.content.data as { deenPrayerReminder?: unknown } | undefined;
    if (d?.deenPrayerReminder === true) {
      await Notifications.cancelScheduledNotificationAsync(r.identifier);
    }
  }
}

type DayWindow = {
  gregorianReadable: string;
  hijriMonthNum?: number;
  timingsIso: Partial<Record<PrayerName, string>>;
  timings: Record<PrayerName, string>;
};

function stripDayMs(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayMatchesReadable(readable: string, targetMidnightMs: number): boolean {
  const n = Date.parse(readable.trim());
  if (!Number.isFinite(n)) return false;
  return stripDayMs(n) === targetMidnightMs;
}

function buildDayWindows(
  today: PrayerTodayPayload,
  cal: PrayerCalendarPayload | null,
): DayWindow[] {
  const out: DayWindow[] = [
    {
      gregorianReadable: today.gregorianDateReadable,
      hijriMonthNum: today.hijriMonthNum,
      timingsIso: today.timingsIso ?? {},
      timings: today.timings,
    },
  ];
  const anchor = new Date();
  anchor.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 2; i++) {
    const t = new Date(anchor);
    t.setDate(t.getDate() + i);
    const tgt = stripDayMs(t.getTime());
    const row = cal?.days.find((d) => dayMatchesReadable(d.gregorianReadable, tgt));
    if (row) {
      out.push({
        gregorianReadable: row.gregorianReadable,
        hijriMonthNum: row.hijriMonthNum,
        timingsIso: row.timingsIso ?? {},
        timings: row.timings,
      });
    }
  }
  return out;
}

function prayerInstant(day: DayWindow, name: PrayerName): number | null {
  return prayerTimingToEpochMs(day.timingsIso[name], day.timings[name]);
}

const SALAH: { key: keyof MobileReminderPrefsState["prayers"]; name: PrayerName }[] = [
  { key: "fajr", name: "Fajr" },
  { key: "dhuhr", name: "Dhuhr" },
  { key: "asr", name: "Asr" },
  { key: "maghrib", name: "Maghrib" },
  { key: "isha", name: "Isha" },
];

function gentleSalah(prayer: PrayerName, approaching: boolean): { title: string; body: string } {
  if (approaching) {
    switch (prayer) {
      case "Fajr":
        return { title: "Fajr", body: "Fajr is approaching. Rise gently, without rush." };
      case "Dhuhr":
        return {
          title: "Dhuhr",
          body: "Dhuhr is approaching. Pause and come back to the present moment.",
        };
      case "Asr":
        return { title: "Asr", body: "Asr is nearing. Transition with a quiet breath." };
      case "Maghrib":
        return {
          title: "Maghrib",
          body: "Maghrib is approaching. May this moment bring peace.",
        };
      case "Isha":
        return { title: "Isha", body: "Isha is nearing. Gather your heart calmly." };
      default:
        return { title: "Salah", body: "A prayer time is approaching." };
    }
  }
  switch (prayer) {
    case "Fajr":
      return { title: "Fajr", body: "Time for Fajr prayer." };
    case "Dhuhr":
      return { title: "Dhuhr", body: "Time for Dhuhr prayer." };
    case "Asr":
      return { title: "Asr", body: "Time for Asr prayer." };
    case "Maghrib":
      return { title: "Maghrib", body: "Time for Maghrib prayer." };
    case "Isha":
      return { title: "Isha", body: "Time for Isha prayer." };
    default:
      return { title: "Salah", body: "A prayer time has arrived." };
  }
}

function jumuahCopy(approaching: boolean): { title: string; body: string } {
  if (approaching) {
    return {
      title: "Friday",
      body: "Jumu'ah draws near — step away gently and settle your heart.",
    };
  }
  return { title: "Friday", body: "Jumu'ah reminder for today." };
}

async function scheduleAt(
  when: Date,
  title: string,
  body: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (when.getTime() <= Date.now() + 8_000) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        ...data,
        deenPrayerReminder: true as const,
      },
      ...(Platform.OS === "android" ? { channelId: ANDROID_CHANNEL } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
    },
  });
}

async function prefetchMonthCalendar(prefs: MobilePrayerLocationPrefs | null): Promise<PrayerCalendarPayload | null> {
  const now = new Date();
  const res = await getPrayerCalendarMonth({
    ...prayerTodayQueryFromPrefs(prefs),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  if ("ok" in res && res.ok && res.days?.length) return res;
  return null;
}

/** Rebuild salah + special reminders across the next ~3 locally visible days (local scheduling only). */
export async function rescheduleLocalPrayerNotifications(input: {
  today: PrayerTodayPayload;
  prefs: MobilePrayerLocationPrefs | null;
  reminder: MobileReminderPrefsState;
  permissionGranted: boolean;
}): Promise<void> {
  await ensureAndroidPrayerChannel();
  await cancelPrayerReminderNotifications();
  if (!input.permissionGranted) return;

  const cal = await prefetchMonthCalendar(input.prefs).catch(() => null);
  const days = buildDayWindows(input.today, cal);
  const lead = input.reminder.leadMinutes;

  for (const day of days) {
    const salahDate = Date.parse(day.gregorianReadable);
    const salahDow = Number.isFinite(salahDate)
      ? new Date(salahDate).getDay()
      : new Date().getDay();
    const isFriday = salahDow === 5;
    const isRamadanApprox = day.hijriMonthNum === 9;

    for (const slot of SALAH) {
      if (!input.reminder.prayers[slot.key]) continue;
      const base = prayerInstant(day, slot.name);
      if (base == null) continue;
      const fireMs = base - lead * 60_000;
      const when = new Date(fireMs);
      const { title, body } = gentleSalah(slot.name, lead > 0);
      await scheduleAt(when, title, body, {
        prayer: slot.key,
        day: day.gregorianReadable,
        kind: "salah",
      });
    }

    if (input.reminder.jumuah && isFriday) {
      const dhuhrIso = prayerInstant(day, "Dhuhr");
      if (dhuhrIso != null) {
        const fireMs = dhuhrIso - lead * 60_000;
        const jam = jumuahCopy(lead > 0);
        await scheduleAt(new Date(fireMs), jam.title, jam.body, {
          prayer: "jumuah",
          day: day.gregorianReadable,
          kind: "jumuah",
        });
      }
    }

    if (input.reminder.suhoor && isRamadanApprox) {
      const fajrIso = prayerInstant(day, "Fajr");
      if (fajrIso != null) {
        const fireMs = fajrIso - lead * 60_000;
        await scheduleAt(
          new Date(fireMs),
          "Suhoor",
          lead > 0
            ? "Suhoor window is narrowing — hydrate and close your meal calmly."
            : "A quiet moment before Fajr. Close suhoor with ease.",
          { prayer: "suhoor", day: day.gregorianReadable, kind: "suhoor" },
        );
      }
    }

    if (input.reminder.iftar && isRamadanApprox) {
      const magIso = prayerInstant(day, "Maghrib");
      if (magIso != null) {
        const fireMs = magIso - lead * 60_000;
        await scheduleAt(
          new Date(fireMs),
          "Iftar",
          lead > 0
            ? "Maghrib is almost here — soften your pace toward breaking fast."
            : "Maghrib has arrived. May your iftar be peaceful.",
          { prayer: "iftar", day: day.gregorianReadable, kind: "iftar" },
        );
      }
    }
  }
}
