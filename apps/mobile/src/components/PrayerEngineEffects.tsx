import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useReducer } from "react";
import { AppState } from "react-native";

import { usePrayerToday } from "../api/hooks/usePrayerToday";
import { readMobilePrayerLocationPrefs } from "../lib/mobile-prayer-prefs";
import { readMobileReminderPrefs } from "../lib/prayer-reminder-storage";
import { prayerDataMarkSynced, prayerDataShouldInvalidate } from "../lib/prayer-stale";
import { getNotificationPermissionStatus } from "../lib/notifications/permissions";
import {
  subscribePrayerNotificationSchedule,
} from "../lib/notifications/prayer-schedule-signal";
import { rescheduleLocalPrayerNotifications } from "../lib/notifications/prayer-scheduler";

function usePrayerPrefsTick(): number {
  const [v, rerender] = useReducer((x) => x + 1, 0);
  useEffect(() => subscribePrayerNotificationSchedule(rerender), []);
  return v;
}

/**
 * Foreground staleness probe + rebuilt calm local salah notifications driven by Expo.
 */
export function PrayerEngineEffects() {
  const qc = useQueryClient();
  const { data, isFetching, isSuccess } = usePrayerToday();
  const tick = usePrayerPrefsTick();

  useEffect(() => {
    void (async () => {
      const prefs = await readMobilePrayerLocationPrefs();
      if (await prayerDataShouldInvalidate(prefs)) {
        await qc.invalidateQueries({ queryKey: ["prayer"] });
      }
    })();
  }, [qc]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      void (async () => {
        const prefs = await readMobilePrayerLocationPrefs();
        if (await prayerDataShouldInvalidate(prefs)) {
          await qc.invalidateQueries({ queryKey: ["prayer"] });
        }
      })();
    });
    return () => sub.remove();
  }, [qc]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isFetching || !isSuccess) return;
      if (!data || !("ok" in data) || !data.ok) return;
      if (cancelled) return;
      const prefs = await readMobilePrayerLocationPrefs();
      await prayerDataMarkSynced(prefs);

      const rem = await readMobileReminderPrefs();
      const granted = (await getNotificationPermissionStatus()) === "granted";
      await rescheduleLocalPrayerNotifications({
        today: data,
        prefs,
        reminder: rem,
        permissionGranted: granted,
      });
    })();

    void tick;

    return () => {
      cancelled = true;
    };
  }, [data, tick, isFetching, isSuccess]);

  return null;
}
