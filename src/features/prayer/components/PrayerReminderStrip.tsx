"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { readPrayerPrefs } from "@/lib/browser/prayer-prefs";
import { buildPrayerFetchQuery } from "@/features/prayer/build-prayer-fetch-query";
import { getCoarseGeoForPrayer } from "@/features/prayer/prayer-fetch";
import {
  readPrayerReminderPreferences,
  selectInAppPrayerReminderLine,
} from "@/lib/prayer/reminder-preferences";
import type { PrayerTodayPayload } from "@/lib/prayer/types";

type Props = {
  learnMoreHref?: string;
  /** When set (even `null` while loading), skip network — parent supplies `/today` snapshot. */
  reuseTodayPayload?: PrayerTodayPayload | null;
};

/**
 * Gentle in-app salah line — not push. Uses device location when allowed, else saved city → server fallback.
 */

export function PrayerReminderStrip({
  learnMoreHref = "/app/prayer/settings",
  reuseTodayPayload,
}: Props) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    if (reuseTodayPayload !== undefined) {
      const tick = () => {
        const reminders = readPrayerReminderPreferences();
        if (!reminders.quietRemindersEnabled || !reuseTodayPayload?.ok) {
          setLine(null);
          return;
        }
        setLine(
          selectInAppPrayerReminderLine({
            nowMs: Date.now(),
            prefs: reminders,
            today: reuseTodayPayload,
          }),
        );
      };
      tick();
      const id = window.setInterval(tick, 30_000);
      return () => window.clearInterval(id);
    }

    const run = async () => {
      const reminders = readPrayerReminderPreferences();
      if (!reminders.quietRemindersEnabled) {
        setLine(null);
        return;
      }
      const prefs = readPrayerPrefs();
      const geo =
        prefs.useBrowserLocation && typeof navigator !== "undefined"
          ? await getCoarseGeoForPrayer()
          : null;
      const qs = buildPrayerFetchQuery(prefs, geo);
      try {
        const res = await fetch(`/api/prayer/today?${qs}`, { cache: "no-store" });
        const j = (await res.json()) as PrayerTodayPayload | { ok?: false };
        if (!res.ok || !j || typeof j !== "object" || !("schedule" in j) || !j.ok) {
          setLine(null);
          return;
        }
        setLine(
          selectInAppPrayerReminderLine({
            nowMs: Date.now(),
            prefs: reminders,
            today: j,
          }),
        );
      } catch {
        setLine(null);
      }
    };

    void run();
    const id = window.setInterval(() => void run(), 30_000);
    const vis = () => {
      if (document.visibilityState === "visible") void run();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [reuseTodayPayload]);

  if (!line) return null;

  return (
    <aside
      className="rounded-2xl border border-emerald-950/14 bg-gradient-to-br from-[#FBF9F5] via-[#EEF6F1] to-[#E6EEE9] px-4 py-3 shadow-sm"
      aria-live="polite"
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-950/55">
        Quiet reminder
      </p>
      <p className="font-display text-[1.05rem] font-medium text-emerald-950 leading-snug mt-1">
        {line}
      </p>
      <p className="text-[0.7rem] text-muted mt-2 leading-relaxed">
        Help me pause when I get busy —{" "}
        <Link href={learnMoreHref} className="font-semibold text-accent underline-offset-4 hover:underline">
          reminders
        </Link>
      </p>
    </aside>
  );
}
