import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  emptySalahPlannerDay,
  SALAH_SLOT_ORDER,
  type SalahPlannerDay,
  type SalahPlannerTask,
  type SalahSlotId,
} from "../contracts/salah-planner";
import { localCalendarDayKey } from "./continuity-storage";

const KEY = "deennotes.mobile.salahPlanner.v1";
const MAX_DAYS = 14;

type Store = {
  schemaVersion: 1;
  days: Record<string, SalahPlannerDay>;
};

function newTaskId(): string {
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { schemaVersion: 1, days: {} };
    const o = JSON.parse(raw) as Partial<Store>;
    if (!o.days || typeof o.days !== "object") return { schemaVersion: 1, days: {} };
    return { schemaVersion: 1, days: o.days };
  } catch {
    return { schemaVersion: 1, days: {} };
  }
}

async function writeStore(store: Store): Promise<void> {
  const keys = Object.keys(store.days).sort((a, b) => b.localeCompare(a));
  const days: Record<string, SalahPlannerDay> = {};
  for (const k of keys.slice(0, MAX_DAYS)) {
    days[k] = store.days[k]!;
  }
  await AsyncStorage.setItem(KEY, JSON.stringify({ schemaVersion: 1, days }));
}

function normalizeDay(raw: Partial<SalahPlannerDay> | undefined, dateKey: string): SalahPlannerDay {
  const base = emptySalahPlannerDay(dateKey);
  if (!raw) return base;
  const slots = { ...base.slots };
  for (const id of SALAH_SLOT_ORDER) {
    const list = raw.slots?.[id];
    if (!Array.isArray(list)) continue;
    slots[id] = list
      .filter(
        (t): t is SalahPlannerTask =>
          Boolean(t) &&
          typeof t === "object" &&
          typeof (t as SalahPlannerTask).id === "string" &&
          typeof (t as SalahPlannerTask).text === "string" &&
          typeof (t as SalahPlannerTask).done === "boolean",
      )
      .map((t) => ({ id: t.id, text: t.text.trim(), done: t.done }))
      .filter((t) => t.text.length > 0);
  }
  return {
    schemaVersion: 1,
    dateKey,
    slots,
    reflection: typeof raw.reflection === "string" ? raw.reflection : "",
  };
}

export async function readSalahPlannerDay(dateKey = localCalendarDayKey()): Promise<SalahPlannerDay> {
  const store = await readStore();
  return normalizeDay(store.days[dateKey], dateKey);
}

async function writeSalahPlannerDay(day: SalahPlannerDay): Promise<void> {
  const store = await readStore();
  store.days[day.dateKey] = day;
  await writeStore(store);
}

export async function addSalahPlannerTask(
  slot: SalahSlotId,
  text: string,
  dateKey = localCalendarDayKey(),
): Promise<SalahPlannerDay> {
  const trimmed = text.trim();
  if (!trimmed) return readSalahPlannerDay(dateKey);
  const day = await readSalahPlannerDay(dateKey);
  const task: SalahPlannerTask = { id: newTaskId(), text: trimmed, done: false };
  day.slots[slot] = [...day.slots[slot], task];
  await writeSalahPlannerDay(day);
  return day;
}

export async function toggleSalahPlannerTask(
  slot: SalahSlotId,
  taskId: string,
  dateKey = localCalendarDayKey(),
): Promise<SalahPlannerDay> {
  const day = await readSalahPlannerDay(dateKey);
  day.slots[slot] = day.slots[slot].map((t) =>
    t.id === taskId ? { ...t, done: !t.done } : t,
  );
  await writeSalahPlannerDay(day);
  return day;
}

export async function removeSalahPlannerTask(
  slot: SalahSlotId,
  taskId: string,
  dateKey = localCalendarDayKey(),
): Promise<SalahPlannerDay> {
  const day = await readSalahPlannerDay(dateKey);
  day.slots[slot] = day.slots[slot].filter((t) => t.id !== taskId);
  await writeSalahPlannerDay(day);
  return day;
}

export async function updateSalahPlannerReflection(
  reflection: string,
  dateKey = localCalendarDayKey(),
): Promise<SalahPlannerDay> {
  const day = await readSalahPlannerDay(dateKey);
  day.reflection = reflection;
  await writeSalahPlannerDay(day);
  return day;
}

export async function readSalahPlannerCompletionSummary(
  dateKey = localCalendarDayKey(),
): Promise<{ done: number; total: number }> {
  const day = await readSalahPlannerDay(dateKey);
  let done = 0;
  let total = 0;
  for (const id of SALAH_SLOT_ORDER) {
    for (const t of day.slots[id]) {
      total += 1;
      if (t.done) done += 1;
    }
  }
  return { done, total };
}
