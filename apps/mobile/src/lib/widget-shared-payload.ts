import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import {
  WIDGET_SHARED_PAYLOAD_FILE,
  WIDGET_SHARED_PAYLOAD_KEY,
} from "../contracts/widget-runtime";
import type { DeennotesWidgetSnapshotV1 } from "./widget-snapshot";

/**
 * Minimal, stable contract the SwiftUI "Next prayer" widget decodes.
 *
 * Keep this SMALL and additive — the Swift `Codable` struct must mirror it exactly.
 * Anything the small + lock-screen widgets do not need stays out of this payload.
 */
export type WidgetSharedPayloadV1 = {
  schemaVersion: 1;
  generatedAtEpochMs: number;
  /** True when the user has at least the master + next-prayer toggles on. */
  hasPrayer: boolean;
  nextPrayerName: string | null;
  /** Wall-clock time string, e.g. "3:42 PM". */
  nextPrayerTime: string | null;
  /** Absolute epoch ms of the next prayer — lets SwiftUI render a live countdown. */
  nextAtEpochMs: number | null;
  /** Pre-computed footer, e.g. "in 1h 12m" (fallback when SwiftUI does not self-tick). */
  countdownLabel: string | null;
  locationLabel: string | null;
  hijriLabel: string | null;
  showBranding: boolean;
};

/** Pure reducer: snapshot → minimal shared payload. Safe to unit test without React. */
export function buildWidgetSharedPayload(
  snap: DeennotesWidgetSnapshotV1,
): WidgetSharedPayloadV1 {
  const p = snap.prayer;
  const prefs = snap.widgetPrefs;
  const hasPrayer = Boolean(prefs.enabled && p && prefs.showNextPrayer);

  return {
    schemaVersion: 1,
    generatedAtEpochMs: snap.generatedAtEpochMs,
    hasPrayer,
    nextPrayerName: hasPrayer ? p?.nextPrayerName ?? null : null,
    nextPrayerTime: hasPrayer ? p?.nextPrayerTime ?? null : null,
    nextAtEpochMs: hasPrayer ? p?.nextAtEpochMs ?? null : null,
    countdownLabel:
      hasPrayer && prefs.showCountdown ? p?.nextPrayerCountdownLabel ?? null : null,
    locationLabel: hasPrayer ? p?.locationLabel ?? null : null,
    hijriLabel: prefs.enabled && prefs.showHijri ? p?.hijriLabel ?? null : null,
    showBranding: prefs.showBranding !== false,
  };
}

/**
 * Optional native bridge that writes into the App Group shared container.
 *
 * Until the WidgetKit pass lands (see `WIDGETS_NATIVE_ENABLED`) there is no native
 * module, so this resolves to `null` and the writer falls back to local mirrors.
 * The seam keeps the call sites stable so flipping on native requires no JS rewrite.
 */
type AppGroupBridge = {
  setItem: (key: string, value: string) => Promise<void> | void;
};

function getAppGroupBridge(): AppGroupBridge | null {
  // Intentionally not wired yet. When a New-Architecture-safe App Group writer is
  // added (tiny Expo module or vetted package), resolve it here and return it.
  return null;
}

/**
 * Persist the minimal payload. Writes to the App Group when the native bridge exists;
 * always mirrors to AsyncStorage + sandbox file for in-app previews and diagnostics.
 * Never throws — widget data is best-effort and must not destabilize the app.
 */
export async function writeWidgetSharedPayload(
  snap: DeennotesWidgetSnapshotV1,
): Promise<void> {
  let raw: string;
  try {
    raw = JSON.stringify(buildWidgetSharedPayload(snap));
  } catch {
    return;
  }

  try {
    await AsyncStorage.setItem(WIDGET_SHARED_PAYLOAD_KEY, raw);
  } catch {
    /* non-fatal */
  }

  const bridge = getAppGroupBridge();
  if (bridge) {
    try {
      await bridge.setItem(WIDGET_SHARED_PAYLOAD_KEY, raw);
    } catch {
      /* non-fatal — fall back to mirrors below */
    }
  }

  try {
    const base = FileSystem.documentDirectory;
    if (base) {
      await FileSystem.writeAsStringAsync(`${base}${WIDGET_SHARED_PAYLOAD_FILE}`, raw, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
  } catch {
    /* optional mirror */
  }
}

export async function readWidgetSharedPayload(): Promise<WidgetSharedPayloadV1 | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_SHARED_PAYLOAD_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as WidgetSharedPayloadV1;
    if (o.schemaVersion !== 1) return null;
    return o;
  } catch {
    return null;
  }
}
