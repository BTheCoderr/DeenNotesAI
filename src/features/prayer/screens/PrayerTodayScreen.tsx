"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildPrayerFetchQuery, type GeoPosition } from "@/features/prayer/build-prayer-fetch-query";
import { PrayerReminderStrip } from "@/features/prayer/components/PrayerReminderStrip";
import { PrayerRhythmPanel } from "@/features/prayer/components/PrayerRhythmPanel";
import { PrayerTimeCard } from "@/features/prayer/components/PrayerTimeCard";
import { readPrayerPrefs, writePrayerPrefs } from "@/lib/browser/prayer-prefs";
import { APP_DISCLAIMER } from "@/lib/constants";
import { readPrayerReminderPreferences } from "@/lib/prayer/reminder-preferences";
import { formatCountdown, PRAYER_CYCLE_ORDER } from "@/lib/prayer/next-prayer-client";
import { scheduleWebPrayerNotificationTimers } from "@/lib/prayer/web-browser-reminders";
import type { PrayerName, PrayerTodayPayload } from "@/lib/prayer/types";

export function PrayerTodayScreen() {
  const [prefs, setPrefs] = useState(readPrayerPrefs);
  const [geo, setGeo] = useState<GeoPosition>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<PrayerTodayPayload | null>(null);
  const [now, setNow] = useState(() => Date.now());

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

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdown = useMemo(() => {
    const t = data?.schedule?.nextAtEpochMs;
    if (t == null || !Number.isFinite(t)) return "—";
    return t > now ? formatCountdown(t - now) : "—";
  }, [data, now]);

  function requestLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo(position);
        const merged = { ...prefs, useBrowserLocation: true };
        setPrefs(merged);
        writePrayerPrefs(merged);
      },
      () => {
        setGeoError("Permission denied or unavailable — open Settings to use city instead.");
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
    );
  }

  const nextName = data?.schedule.nextPrayer;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-28">
      <header className="space-y-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/80">
          Today
        </p>
        <h1 className="font-display text-[1.85rem] font-semibold text-ink leading-tight">
          Prayer times
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Estimates from AlAdhan. Follow your local masjid when it matters for you.
        </p>
      </header>

      <PrayerReminderStrip learnMoreHref="/app/prayer/settings" reuseTodayPayload={data} />

      <section className="rounded-[1.35rem] border border-black/[0.06] bg-[#F9F6F1]/90 p-5 space-y-4 shadow-sm">
        <p className="text-xs text-muted leading-relaxed">
          {APP_DISCLAIMER} These times support reflection and scheduling — not legal validity.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={requestLocation}
            className="rounded-full border border-emerald-900/20 bg-emerald-950/[0.06] px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-950/10 transition-colors"
          >
            Use device area
          </button>
          <button
            type="button"
            onClick={() => {
              const merged = { ...prefs, useBrowserLocation: false };
              setPrefs(merged);
              writePrayerPrefs(merged);
              setGeo(null);
            }}
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
          >
            Prefer saved city
          </button>
          <Link
            href="/app/prayer/settings"
            className="rounded-full border border-emerald-950/15 bg-white px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-stone-50"
          >
            Location &amp; method
          </Link>
        </div>
        {geoError ? <p className="text-xs text-amber-800">{geoError}</p> : null}

        {!prefs.useBrowserLocation ? (
          <p className="text-sm text-muted">
            Using <span className="font-medium text-ink">{prefs.city}</span>,{" "}
            <span className="font-medium text-ink">{prefs.country}</span>. Change in settings.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Using an approximate area from your browser. Coordinates are not stored.
          </p>
        )}
      </section>

      {loading ? (
        <p className="text-sm text-muted text-center py-8">Gathering times…</p>
      ) : null}
      {err ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {err}
        </p>
      ) : null}

      {data?.ok ? (
        <section className="space-y-4">
          <PrayerRhythmPanel
            data={data}
            momentTitle="Today's salah rhythm"
            hubLink={null}
          />
          {data.isRamadanDay ? (
            <p className="text-xs text-emerald-900/80 px-1 leading-relaxed">
              Ramadan day {data.ramadanDay ?? "—"} · take food and sleep gently.
            </p>
          ) : null}

          <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-4 space-y-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
              Flow
            </p>
            <p className="text-sm text-muted leading-relaxed">{data.schedule.currentLabel}</p>
            <div className="flex items-baseline justify-between gap-3 pt-1">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wide text-accent">Next</p>
                <p className="font-display text-xl font-semibold text-ink">{data.schedule.nextPrayer}</p>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-emerald-900">{countdown}</p>
            </div>
          </div>

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
        </section>
      ) : null}

      <footer className="text-[0.72rem] text-muted leading-relaxed pb-8">
        Unset locations default to Providence, Rhode Island, United States. Preferences stay on this
        device.
      </footer>
    </div>
  );
}
