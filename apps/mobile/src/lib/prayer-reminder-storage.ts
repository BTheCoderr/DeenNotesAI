import AsyncStorage from "@react-native-async-storage/async-storage";

import { PRAYER_REMINDER_PRAYERS, REMINDER_OFFSETS_MINUTES } from "../contracts/prayer-preferences";

export type MobileReminderPrefsState = {
  leadMinutes: (typeof REMINDER_OFFSETS_MINUTES)[number];
  prayers: Record<(typeof PRAYER_REMINDER_PRAYERS)[number], boolean>;
  jumuah: boolean;
  suhoor: boolean;
  iftar: boolean;
};

const STORAGE_KEY = "deennotes.mobile.prayer.reminders.v1";

const defaultPrayers = (): MobileReminderPrefsState["prayers"] => ({
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
});

export const DEFAULT_REMINDER_PREFS: MobileReminderPrefsState = {
  leadMinutes: 10,
  prayers: defaultPrayers(),
  jumuah: false,
  suhoor: false,
  iftar: false,
};

export async function readMobileReminderPrefs(): Promise<MobileReminderPrefsState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_REMINDER_PREFS, prayers: defaultPrayers() };
    const o = JSON.parse(raw) as Partial<MobileReminderPrefsState>;
    const lead = Number(o.leadMinutes);
    const leadMinutes = REMINDER_OFFSETS_MINUTES.includes(
      lead as MobileReminderPrefsState["leadMinutes"],
    )
      ? (lead as MobileReminderPrefsState["leadMinutes"])
      : DEFAULT_REMINDER_PREFS.leadMinutes;
    const prayers = { ...defaultPrayers(), ...o.prayers };
    return {
      leadMinutes,
      prayers,
      jumuah: Boolean(o.jumuah),
      suhoor: Boolean(o.suhoor),
      iftar: Boolean(o.iftar),
    };
  } catch {
    return { ...DEFAULT_REMINDER_PREFS, prayers: defaultPrayers() };
  }
}

export async function writeMobileReminderPrefs(next: MobileReminderPrefsState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
