import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import type { Chapter, PrayerTodayPayload, PrayerTodayResponse } from "../api/types";
import type { ContinuityPreferencesV1 } from "../contracts/continuity-preferences";
import type {
  LiveActivityPlaceholderUnionV1,
  LiveActivityPrayerCountdownV1,
  LiveActivityPrayerWindowV1,
  LiveActivityRamadanHintV1,
} from "../contracts/live-activity-prep";
import type { WidgetPreferencesV1 } from "../contracts/widget-preferences";
import { formatCountdown, formatPrayerInPhrase } from "./format-time";
import { formatNextPrayerCountdown } from "../services/prayerTimesService";
import type { ContinueReadingState } from "./quran-continue-reading";
import { pickDailyAyahRef, stableLocalDaySeed } from "./daily-ayah";
import {
  readCachedChapterVerses,
  verseGlanceFromCache,
} from "./quran-offline-cache";

const STORAGE_KEY = "deennotes.mobile.widgetSnapshot.v1";

export type WidgetReflectionReminder = {
  title: string | null;
  subtitle: string;
};

export type WidgetPrayerSlice = {
  /** Display name for the upcoming salah row. */
  nextPrayerName: string;
  /** Wall-clock time string for today’s next salah (defaults). */
  nextPrayerTime: string | null;
  /** H/M style countdown suited for widgets. */
  nextPrayerCountdownLabel: string;
  /** Mirrors snapshot build timestamp for freshness checks. */
  generatedAtEpochMs: number;
  nextAtEpochMs: number | null;
  countdownLabel: string;
  softPhrase: string;
  hijriLabel: string | null;
  gregorianReadable: string | null;
  locationLabel: string | null;
  isRamadanApprox: boolean;
  ramadanDayApprox: number | null;
};

export type WidgetDailyAyahSlice = {
  surahId: number;
  ayah: number;
  surahName: string | null;
  arabicLine: string | null;
  translationLine: string | null;
};

export type WidgetContinueSlice = {
  surahId: number;
  ayah: number;
  surahName: string | null;
  subtitle: string;
};

export type WidgetContinuitySlice = {
  returnTodayCopy: string | null;
  lastReflectCopy: string | null;
};

/**
 * Serialized JSON consumed by RN previews today; Swift WidgetKit target should mirror this shape via App Group.
 */
export type DeennotesWidgetSnapshotV1 = {
  schemaVersion: 1;
  generatedAtEpochMs: number;
  widgetPrefs: WidgetPreferencesV1;
  continuityPrefs: ContinuityPreferencesV1;
  prayer: WidgetPrayerSlice | null;
  dailyAyah: WidgetDailyAyahSlice | null;
  continueReading: WidgetContinueSlice | null;
  reflectionReminder: WidgetReflectionReminder | null;
  continuity: WidgetContinuitySlice;
  /** Native-only consumers may ignore until ActivityKit lands. */
  liveActivityPrep: LiveActivityPlaceholderUnionV1[];
};

export type WidgetSnapshotInputs = {
  nowMs: number;
  prayer: PrayerTodayResponse | undefined;
  chapters: Chapter[] | undefined;
  continueReading: ContinueReadingState | null;
  recentNote:
    | {
        title: string;
        created_at: string;
        short_summary?: string;
        main_reminder?: string;
      }
    | null
    | undefined;
  widgetPrefs: WidgetPreferencesV1;
  continuityPrefs: ContinuityPreferencesV1;
  visitedTodayResolved: boolean;
};

function pruneLines(s: string, maxChars: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

export function gentleRelativeReflection(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days < 1) return "Last reflection was today.";
  if (days === 1) return "Last reflection was yesterday.";
  if (days < 14) return `Last reflection was ${days} days ago — return when your heart allows.`;
  return "It has been some time since your last reflection — no rush.";
}

export function buildLiveActivitySeeds(prayerOk: PrayerTodayPayload, nowMs: number): LiveActivityPlaceholderUnionV1[] {
  const countdownMs =
    prayerOk.schedule.nextAtEpochMs != null
      ? prayerOk.schedule.nextAtEpochMs - nowMs
      : null;
  const countdown: LiveActivityPrayerCountdownV1 = {
    schemaVersion: 1,
    surface: "live_activity",
    kind: "next_prayer_countdown",
    nextPrayerName: prayerOk.schedule.nextPrayer,
    nextAtEpochMs: prayerOk.schedule.nextAtEpochMs,
    locationLabel: prayerOk.locationLabel,
    hijriLabel: prayerOk.hijriLabel ?? null,
    countdownLabel: formatCountdown(countdownMs != null ? Math.max(0, countdownMs) : null),
    isRamadanApprox: Boolean(prayerOk.isRamadanDay),
  };

  const window: LiveActivityPrayerWindowV1 = {
    schemaVersion: 1,
    surface: "live_activity",
    kind: "within_prayer_window",
    currentPrayerLabel: prayerOk.schedule.currentLabel ?? null,
    nextPrayerName: prayerOk.schedule.nextPrayer,
    nextAtEpochMs: prayerOk.schedule.nextAtEpochMs,
    locationLabel: prayerOk.locationLabel,
  };

  const out: LiveActivityPlaceholderUnionV1[] = [countdown, window];

  if (prayerOk.isRamadanDay) {
    const ramadan: LiveActivityRamadanHintV1 = {
      schemaVersion: 1,
      surface: "live_activity",
      kind: "ramadan_context",
      hijriLabel: prayerOk.hijriLabel ?? null,
      ramadanDayApprox: prayerOk.ramadanDay ?? null,
      gentleLine:
        prayerOk.ramadanDay != null
          ? `Ramadan continuum — soften your rhythm today (about day ${prayerOk.ramadanDay}).`
          : "Ramadan continuum — soften your rhythm today.",
    };
    out.push(ramadan);
  }

  return out;
}

/** Pure builder — reusable from tests or native bridge without React. */
export function buildWidgetSnapshotV1(inputs: WidgetSnapshotInputs): DeennotesWidgetSnapshotV1 {
  const pf = inputs.widgetPrefs;
  const cf = inputs.continuityPrefs;

  let prayerSlice: WidgetPrayerSlice | null = null;
  let livePrep: LiveActivityPlaceholderUnionV1[] = [];
  let prayerPayload: PrayerTodayPayload | undefined;

  if (inputs.prayer && "ok" in inputs.prayer && inputs.prayer.ok && pf.enabled) {
    prayerPayload = inputs.prayer;
    livePrep = buildLiveActivitySeeds(inputs.prayer, inputs.nowMs);
    if (pf.showNextPrayer || pf.showCountdown || pf.showHijri) {
      const nextMs =
        inputs.prayer.schedule.nextAtEpochMs != null
          ? inputs.prayer.schedule.nextAtEpochMs - inputs.nowMs
          : null;
      const nextName = pf.showNextPrayer ? inputs.prayer.schedule.nextPrayer : "—";
      const nextTime =
        pf.showNextPrayer && inputs.prayer.timings[inputs.prayer.schedule.nextPrayer]
          ? inputs.prayer.timings[inputs.prayer.schedule.nextPrayer]
          : null;
      prayerSlice = {
        nextPrayerName: nextName,
        nextPrayerTime: nextTime,
        nextPrayerCountdownLabel: pf.showCountdown
          ? formatNextPrayerCountdown(nextMs != null ? Math.max(0, nextMs) : null)
          : "—",
        generatedAtEpochMs: inputs.nowMs,
        nextAtEpochMs: pf.showCountdown ? inputs.prayer.schedule.nextAtEpochMs : null,
        countdownLabel: pf.showCountdown ? formatCountdown(nextMs) : "—",
        softPhrase: pf.showCountdown ? formatPrayerInPhrase(nextMs) : "Salah rhythm",
        hijriLabel: pf.showHijri ? inputs.prayer.hijriLabel ?? null : null,
        gregorianReadable: inputs.prayer.gregorianDateReadable ?? null,
        locationLabel: inputs.prayer.locationLabel ?? null,
        isRamadanApprox: Boolean(inputs.prayer.isRamadanDay),
        ramadanDayApprox: inputs.prayer.ramadanDay ?? null,
      };
    }
  }

  const daySeed = stableLocalDaySeed(new Date(inputs.nowMs));
  const chap = inputs.chapters ?? [];
  const ref = pickDailyAyahRef(daySeed, chap);

  /** daily ayah snippets filled async in persistence layer optionally — here placeholders from sync path */
  let dailyAyahSlice: WidgetDailyAyahSlice | null = null;
  if (pf.enabled && pf.showDailyAyah) {
    const meta = chap.find((c) => c.id === ref.surahId);
    dailyAyahSlice = {
      surahId: ref.surahId,
      ayah: ref.ayah,
      surahName: meta?.translatedName ?? meta?.nameSimple ?? null,
      arabicLine: null,
      translationLine: null,
    };
  }

  let continueSlice: WidgetContinueSlice | null = null;
  if (pf.enabled && pf.showContinueReading && inputs.continueReading) {
    const cont = inputs.continueReading;
    const m = chap.find((c) => c.id === cont.surahId);
    continueSlice = {
      surahId: cont.surahId,
      ayah: cont.ayah,
      surahName: m?.translatedName ?? m?.nameSimple ?? `Surah ${cont.surahId}`,
      subtitle: "Return gently to where you paused.",
    };
  }

  let reflectionReminder: WidgetReflectionReminder | null = null;
  if (pf.enabled && pf.showReflectionReminder) {
    if (inputs.recentNote?.title) {
      reflectionReminder = {
        title: pruneLines(inputs.recentNote.title, 48),
        subtitle: "Open Reflect when you have a calm moment.",
      };
    } else {
      reflectionReminder = {
        title: null,
        subtitle: "A quiet reflection can start with one sentence.",
      };
    }
  }

  let returnTodayCopy: string | null = null;
  if (cf.showReturnToday && inputs.visitedTodayResolved) {
    returnTodayCopy = cf.preferMinimalCopy ? "You returned today." : "You returned today — barakallah.";
  }

  let lastReflectCopy: string | null = null;
  if (cf.showLastReflectionRecap && inputs.recentNote?.created_at) {
    lastReflectCopy = gentleRelativeReflection(inputs.recentNote.created_at);
  }

  return {
    schemaVersion: 1,
    generatedAtEpochMs: inputs.nowMs,
    widgetPrefs: inputs.widgetPrefs,
    continuityPrefs: inputs.continuityPrefs,
    prayer: pf.enabled ? prayerSlice : null,
    dailyAyah: pf.enabled ? dailyAyahSlice : null,
    continueReading: pf.enabled ? continueSlice : null,
    reflectionReminder: pf.enabled ? reflectionReminder : null,
    continuity: { returnTodayCopy, lastReflectCopy },
    liveActivityPrep: prayerPayload ? livePrep : [],
  };
}

/** Enrich snapshot with offline verse lines (cache read — no network). */
export async function hydrateWidgetSnapshotVerses(
  snap: DeennotesWidgetSnapshotV1,
): Promise<DeennotesWidgetSnapshotV1> {
  if (!snap.dailyAyah) return snap;
  const cached = await readCachedChapterVerses(snap.dailyAyah.surahId);
  const g = verseGlanceFromCache(snap.dailyAyah.ayah, cached);
  return {
    ...snap,
    dailyAyah: {
      ...snap.dailyAyah,
      arabicLine: g.arabic ? pruneLines(g.arabic, 120) : snap.dailyAyah.arabicLine,
      translationLine: g.translation ? pruneLines(g.translation, 180) : snap.dailyAyah.translationLine,
    },
  };
}

export async function persistWidgetSnapshot(snapshot: DeennotesWidgetSnapshotV1): Promise<void> {
  const raw = JSON.stringify(snapshot);
  await AsyncStorage.setItem(STORAGE_KEY, raw);

  try {
    const base = FileSystem.documentDirectory;
    if (base) {
      await FileSystem.writeAsStringAsync(`${base}deennotes_widget_snapshot.json`, raw, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
  } catch {
    /* optional file mirror for diagnostics / future bridge */
  }
}

export async function readWidgetSnapshot(): Promise<DeennotesWidgetSnapshotV1 | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as DeennotesWidgetSnapshotV1;
    if (o.schemaVersion !== 1) return null;
    return o;
  } catch {
    return null;
  }
}
