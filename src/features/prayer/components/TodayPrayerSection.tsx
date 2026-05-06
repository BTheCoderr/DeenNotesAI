"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { buildPrayerFetchQuery, type GeoPosition } from "@/features/prayer/build-prayer-fetch-query";
import { readPrayerPrefs } from "@/lib/browser/prayer-prefs";
import {
  readPrayerReminderPreferences,
  selectInAppPrayerReminderLine,
} from "@/lib/prayer/reminder-preferences";
import {
  cancelWebPrayerNotificationTimers,
  scheduleWebPrayerNotificationTimers,
} from "@/lib/prayer/web-browser-reminders";
import type { PrayerTodayPayload } from "@/lib/prayer/types";

import { QuietReminderBanner } from "@/components/spiritual/QuietReminderBanner";
import { RamadanBanner } from "@/components/spiritual/RamadanBanner";
import { JumuahCardToday } from "@/components/spiritual/JumuahCardToday";

import { PrayerRhythmPanel } from "./PrayerRhythmPanel";

async function fetchGeoCoarse(): Promise<GeoPosition> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (g) => resolve(g),
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: 120_000, timeout: 8000 },
    );
  });
}

/**
 * Single `/api/prayer/today` fetch for Today: reminder line + moment card + Ramadan / Jumu’ah chrome.
 */

export function TodayPrayerSection() {
  const [prefs] = useState(() => readPrayerPrefs());
  const [data, setData] = useState<PrayerTodayPayload | null>(null);

  const load = useCallback(async () => {
    try {
      let geo: GeoPosition = null;
      if (prefs.useBrowserLocation) {
        geo = await fetchGeoCoarse();
      }
      const qs = buildPrayerFetchQuery(prefs, geo);
      const res = await fetch(`/api/prayer/today?${qs}`, { cache: "no-store" });
      const j = (await res.json()) as PrayerTodayPayload | { ok?: false };
      if (res.ok && j && typeof j === "object" && "schedule" in j && j.ok) {
        const payload = j as PrayerTodayPayload;
        setData(payload);
        const rem = readPrayerReminderPreferences();
        scheduleWebPrayerNotificationTimers(rem, payload);
      } else {
        setData(null);
        cancelWebPrayerNotificationTimers();
      }
    } catch {
      setData(null);
      cancelWebPrayerNotificationTimers();
    }
  }, [prefs]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => cancelWebPrayerNotificationTimers();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 600_000);
    return () => window.clearInterval(id);
  }, [load]);

  /* Recompute polite line periodically */

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const lineLive = useMemo(() => {
    void tick;
    if (!data?.ok) return null;
    return selectInAppPrayerReminderLine({
      nowMs: Date.now(),
      prefs: readPrayerReminderPreferences(),
      today: data,
    });
  }, [data, tick]);

  return (
    <div className="space-y-5">
      <QuietReminderBanner message={lineLive} />
      <PrayerRhythmPanel data={data} />
      {data?.ok && data.isRamadanDay ? <RamadanBanner ramadanDay={data.ramadanDay} /> : null}
      {data?.ok ? <JumuahCardToday /> : null}
    </div>
  );
}
