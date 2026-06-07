import { PRAYER_REMINDER_PRAYERS } from "./prayer-preferences";

export type SalahSlotId = (typeof PRAYER_REMINDER_PRAYERS)[number];

export const SALAH_SLOT_ORDER: readonly SalahSlotId[] = PRAYER_REMINDER_PRAYERS;

export type SalahPlannerTask = {
  id: string;
  text: string;
  done: boolean;
};

export type SalahPlannerDay = {
  schemaVersion: 1;
  /** Local calendar day (YYYY-MM-DD). */
  dateKey: string;
  slots: Record<SalahSlotId, SalahPlannerTask[]>;
  /** Free-text answer to the daily reflection prompt. */
  reflection: string;
};

/** Slot that carries the daily reflection prompt in the MVP. */
export const REFLECTION_SLOT: SalahSlotId = "dhuhr";

export const REFLECTION_PROMPT =
  "What do you want to return to before the next prayer?";

export const REFLECTION_PROMPT_LEARNING =
  "What gentle step do you want to remember before the next prayer?";

export const SLOT_DISPLAY: Record<SalahSlotId, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function emptySalahPlannerDay(dateKey: string): SalahPlannerDay {
  const slots = {} as Record<SalahSlotId, SalahPlannerTask[]>;
  for (const id of SALAH_SLOT_ORDER) {
    slots[id] = [];
  }
  return { schemaVersion: 1, dateKey, slots, reflection: "" };
}
