"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { buildPrayerFetchQuery, type GeoPosition } from "@/features/prayer/build-prayer-fetch-query";
import { PrayerRhythmPanel } from "@/features/prayer/components/PrayerRhythmPanel";
import { PrayerTimeCard } from "@/features/prayer/components/PrayerTimeCard";
import { readPrayerPrefs, writePrayerPrefs } from "@/lib/browser/prayer-prefs";
import { readPrayerReminderPreferences } from "@/lib/prayer/reminder-preferences";
import { PRAYER_CYCLE_ORDER } from "@/lib/prayer/next-prayer-client";
import { scheduleWebPrayerNotificationTimers } from "@/lib/prayer/web-browser-reminders";
import type { PrayerName, PrayerTodayPayload } from "@/lib/prayer/types";

function isFridayLocal(): boolean {
  return new Date().getDay() === 5;
}

/** Today’s prayer experience: rhythm, list, dates, gentle season cards — preferences live in Settings. */
export function PrayerTodayScreen() {
  const [prefs, setPrefs] = useState(readPrayerPrefs);
  const [geo, setGeo] = useState<GeoPosition>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<PrayerTodayPayload | null>(null);
  const [friday, setFriday] = useState(false);

  useEffect(() => {
    setFriday(isFridayLocal());
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      let g = geo;
      if (prefs.useBrowserLocation && !g && typeof navigator !== "undefined") {
        g = await new Promise<GeoPosition>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            () => resolve(null),
            { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
          );
        });
        setGeo(g);
      }

      const qs = buildPrayerFetchQuery(prefs, g);
      const res = await fetch(`/api/prayer/today?${qs}`, { cache: "no-store" });
      const j = (await res.json()) as
        | PrayerTodayPayload
        | { ok?: false; error?: string };
      if (!res.ok || !j || typeof j !== "object" || !("schedule" in j) || !j.ok) {
        setErr(
          typeof j === "object" && j && "error" in j && typeof j.error === "string"
            ? j.error
            : "Could not load prayer times.",
        );
        setData(null);
        return;
      }
      const payload = j as PrayerTodayPayload;
      setData(payload);
      scheduleWebPrayerNotificationTimers(readPrayerReminderPreferences(), payload);
    } catch {
      setErr("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [prefs, geo]);

  useEffect(() => {
    void load();
  }, [load]);

  const nextName = data?.schedule.nextPrayer;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-28">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/80">
              Prayer
            </p>
            <h1 className="font-display text-[1.85rem] font-semibold text-ink leading-tight">
              Today
            </h1>
            <p className="text-sm text-muted leading-relaxed mt-1">
              Estimates from AlAdhan — follow your local masjid when it matters for you.
            </p>
          </div>
          <Link
            href="/app/prayer/settings"
            className="shrink-0 rounded-full bg-emerald-950 px-4 py-2.5 text-xs font-semibold text-[#F9F6F1] hover:bg-emerald-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-950"
          >
            Prayer preferences
          </Link>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-muted text-center py-6">Gathering times…</p>
      ) : null}
      {err ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {err}
        </p>
      ) : null}

      {data?.ok ? (
        <>
          <PrayerRhythmPanel
            data={data}
            momentTitle="Today’s salah rhythm"
            hubLink={null}
          />

          {data.isRamadanDay ? (
            <section className="rounded-2xl border border-emerald-950/15 bg-gradient-to-br from-emerald-950/[0.06] to-amber-100/40 px-4 py-4 space-y-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-950/75">
                Ramadan
              </p>
              <p className="text-sm font-semibold text-ink">
                Ramadan day {data.ramadanDay ?? "—"}
              </p>
              <p className="text-xs text-muted leading-relaxed">
                Slow your pace around food and sleep — preferences and reminders stay under Settings.
              </p>
            </section>
          ) : null}

          {friday ? (
            <section className="rounded-2xl border border-black/[0.06] bg-[#F9F6F1]/90 px-4 py-4 space-y-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
                Jumu&apos;ah
              </p>
              <p className="text-sm text-ink leading-relaxed">
                A gentle nudge for the blessed hour — settle early, phone away, heart present. Khutbah
                notes live under Reflect when you capture them.
              </p>
            </section>
          ) : null}

          <ul className="space-y-2">
            {PRAYER_CYCLE_ORDER.map((name: PrayerName) => (
              <li key={name}>
                <PrayerTimeCard
                  name={name}
                  time={data.timings[name] ?? "—"}
                  highlight={nextName === name}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="text-xs text-muted leading-relaxed px-0.5">
        <button
          type="button"
          className="font-semibold text-accent hover:underline"
          onClick={() => {
            const merged = { ...prefs, useBrowserLocation: true };
            setPrefs(merged);
            writePrayerPrefs(merged);
            setGeo(null);
            void load();
          }}
        >
          Refresh with device area
        </button>
        {" · "}
        <Link href="/app/prayer/settings" className="font-semibold text-accent hover:underline">
          Change city or method
        </Link>
        . Defaults unset? Providence, Rhode Island.
      </p>

      <footer className="text-[0.72rem] text-muted leading-relaxed pb-8">
        Prayer reminders and calculation details live under Settings → Prayer preferences / Prayer reminders.
      </footer>
    </div>
  );
}
