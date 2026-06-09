import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useChapters } from "../api/hooks/useChapters";
import { useDeenNotesList } from "../api/hooks/useDeenNotes";
import { usePrayerToday } from "../api/hooks/usePrayerToday";
import { useMobileSession } from "../hooks/useMobileSession";
import { readContinuityPreferences } from "../lib/continuity-prefs-storage";
import { recordContinuityVisit, returnedToday } from "../lib/continuity-storage";
import { readContinueReading } from "../lib/quran-continue-reading";
import { readWidgetPreferences } from "../lib/widget-prefs-storage";
import {
  buildWidgetSnapshotV1,
  hydrateWidgetSnapshotVerses,
  persistWidgetSnapshot,
} from "../lib/widget-snapshot";
import { writeWidgetSharedPayload } from "../lib/widget-shared-payload";

const THROTTLE_MS = 6_000;

/**
 * Mirrors prayer / Quran / reflections into serialized JSON locally.
 * For in-app previews now; a future WidgetKit target should read shared App Group data.
 */
export function WidgetSnapshotEffects() {
  const { data: prayer } = usePrayerToday();
  const { data: chData } = useChapters();
  const auth = useMobileSession();
  const notes = useDeenNotesList(Boolean(auth.accessToken));

  const [tick, setTick] = useState(0);
  const lastPersist = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        void recordContinuityVisit().finally(() => setTick((x) => x + 1));
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    void recordContinuityVisit();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const nowMs = Date.now();
      const last = lastPersist.current;
      if (nowMs - last < THROTTLE_MS && tick !== 0) return;
      lastPersist.current = nowMs;

      const [wprefs, cprefs, cont, visitToday] = await Promise.all([
        readWidgetPreferences(),
        readContinuityPreferences(),
        readContinueReading(),
        returnedToday(),
      ]);

      const recent = notes.data?.[0];

      const snap = buildWidgetSnapshotV1({
        nowMs,
        prayer,
        chapters: chData?.chapters,
        continueReading: cont,
        recentNote: recent ?? null,
        widgetPrefs: wprefs,
        continuityPrefs: cprefs,
        visitedTodayResolved: visitToday,
      });
      const hydrated = await hydrateWidgetSnapshotVerses(snap);
      if (cancelled) return;
      await persistWidgetSnapshot(hydrated);
      // Minimal payload for the native WidgetKit extension (App Group when available).
      await writeWidgetSharedPayload(hydrated);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [prayer, chData?.chapters, notes.data, tick]);

  return null;
}
