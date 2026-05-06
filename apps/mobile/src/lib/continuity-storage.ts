import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "deennotes.mobile.continuity.visits.v1";

type Row = {
  schemaVersion: 1;
  /** Local calendar days (YYYY-MM-DD) the app was opened — newest first, capped. */
  visitLocalDays: string[];
};

async function readRow(): Promise<Row> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { schemaVersion: 1, visitLocalDays: [] };
    const o = JSON.parse(raw) as Partial<Row>;
    if (!Array.isArray(o.visitLocalDays)) return { schemaVersion: 1, visitLocalDays: [] };
    const days = o.visitLocalDays.filter((x): x is string => typeof x === "string");
    return { schemaVersion: 1, visitLocalDays: days.slice(0, 120) };
  } catch {
    return { schemaVersion: 1, visitLocalDays: [] };
  }
}

async function writeRow(row: Row): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(row));
}

export function localCalendarDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Called on foreground — records at most one entry per local calendar day.
 */
export async function recordContinuityVisit(now = new Date()): Promise<void> {
  const key = localCalendarDayKey(now);
  const row = await readRow();
  const without = row.visitLocalDays.filter((x) => x !== key);
  const visitLocalDays = [key, ...without].slice(0, 90);
  await writeRow({ schemaVersion: 1, visitLocalDays });
}

/** How many distinct local calendar days we've seen (informational — not a streak score). */
export async function readSoftContinuityVisitCount(): Promise<number> {
  const row = await readRow();
  return row.visitLocalDays.length;
}

export async function returnedToday(now = new Date()): Promise<boolean> {
  const row = await readRow();
  const today = localCalendarDayKey(now);
  return row.visitLocalDays[0] === today;
}

/**
 * Consecutive local calendar days ending today that have a continuity visit recorded.
 */
export async function readJourneyStreak(now = new Date()): Promise<number> {
  const row = await readRow();
  const logged = new Set(row.visitLocalDays);
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  while (streak < 365) {
    const key = localCalendarDayKey(cursor);
    if (!logged.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function readVisitDaySet(): Promise<ReadonlySet<string>> {
  const row = await readRow();
  return new Set(row.visitLocalDays);
}
