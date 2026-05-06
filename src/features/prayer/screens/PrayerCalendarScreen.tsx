"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildPrayerFetchQuery, type GeoPosition } from "@/features/prayer/build-prayer-fetch-query";
import { readPrayerPrefs } from "@/lib/browser/prayer-prefs";
import { APP_DISCLAIMER } from "@/lib/constants";
import { HIJRI_SCAFFOLD_DAYS } from "@/lib/prayer/types";
import type { PrayerHijriCalendarPayload, PrayerTodayPayload } from "@/lib/prayer/types";

export function PrayerCalendarScreen() {
  const [prefs] = useState(() => readPrayerPrefs());
  const [geo, setGeo] = useState<GeoPosition>(null);
  const [hijriYear, setHijriYear] = useState(1447);
  const [hijriMonth, setHijriMonth] = useState(1);
  const [todayMeta, setTodayMeta] = useState<PrayerTodayPayload | null>(null);
  const [calendar, setCalendar] = useState<PrayerHijriCalendarPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hydrateFromToday = useCallback(async () => {
    try {
      let g: GeoPosition = null;
      if (prefs.useBrowserLocation && navigator.geolocation) {
        g = await new Promise<GeoPosition>((resolve) => {
          navigator.geolocation.getCurrentPosition((x) => resolve(x), () => resolve(null), {
            enableHighAccuracy: false,
            maximumAge: 300_000,
            timeout: 8000,
          });
        });
        setGeo(g);
      }
      const qs = buildPrayerFetchQuery(prefs, g);
      const res = await fetch(`/api/prayer/today?${qs}`, { cache: "no-store" });
      const j = (await res.json()) as PrayerTodayPayload | { ok?: false };
      if (res.ok && j && typeof j === "object" && "schedule" in j && j.ok) {
        const t = j as PrayerTodayPayload;
        setTodayMeta(t);
        const y = Number(t.hijriYear);
        const mo = t.hijriMonthNum;
        if (Number.isFinite(y)) setHijriYear(Math.trunc(y));
        if (typeof mo === "number" && mo >= 1 && mo <= 12) setHijriMonth(mo);
      }
    } catch {
      /* noop */
    }
  }, [prefs]);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      let g = geo;
      if (prefs.useBrowserLocation && !g && navigator.geolocation) {
        g = await new Promise<GeoPosition>((resolve) => {
          navigator.geolocation.getCurrentPosition((x) => resolve(x), () => resolve(null), {
            enableHighAccuracy: false,
            maximumAge: 120_000,
            timeout: 8000,
          });
        });
        setGeo(g);
      }
      const base = buildPrayerFetchQuery(prefs, g);
      const qs = `${base}&hijriYear=${hijriYear}&hijriMonth=${hijriMonth}`;
      const res = await fetch(`/api/prayer/hijri?${qs}`, { cache: "no-store" });
      const j = (await res.json()) as PrayerHijriCalendarPayload | { ok?: false; error?: string };
      if (!res.ok || !j || typeof j !== "object" || !j.ok || !("days" in j)) {
        setErr(typeof j === "object" && j && "error" in j && typeof j.error === "string" ? j.error : "Could not load calendar.");
        setCalendar(null);
        return;
      }
      setCalendar(j);
    } catch {
      setErr("Network error.");
      setCalendar(null);
    } finally {
      setLoading(false);
    }
  }, [prefs, geo, hijriYear, hijriMonth]);

  useEffect(() => {
    void hydrateFromToday();
  }, [hydrateFromToday]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const scaffold = useMemo(
    () => HIJRI_SCAFFOLD_DAYS.filter((d) => d.hijriApproxMonth === hijriMonth),
    [hijriMonth],
  );

  const displayMonthName =
    calendar?.days[0]?.hijriLabel?.split(" ").filter(Boolean)[1] ?? `Month ${hijriMonth}`;

  return (
    <div className="max-w-lg mx-auto space-y-8 pb-28">
      <header className="space-y-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/80">
          Calendar
        </p>
        <h1 className="font-display text-[1.85rem] font-semibold text-ink leading-tight">
          Hijri month
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Mirrors AlAdhan&apos;s Hijri calendar for your locality. Community sighting remains the
          human anchor.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-stone-100"
          onClick={() => {
            if (hijriMonth <= 1) {
              setHijriYear((y) => y - 1);
              setHijriMonth(12);
            } else setHijriMonth((m) => m - 1);
          }}
        >
          ← Prior month
        </button>
        <button
          type="button"
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-stone-100"
          onClick={() => {
            if (hijriMonth >= 12) {
              setHijriYear((y) => y + 1);
              setHijriMonth(1);
            } else setHijriMonth((m) => m + 1);
          }}
        >
          Next month →
        </button>
        <button
          type="button"
          className="rounded-full border border-emerald-950/15 bg-emerald-950/5 px-3 py-1.5 text-xs font-semibold text-emerald-950"
          onClick={() => void hydrateFromToday()}
        >
          Jump to today
        </button>
      </div>

      {todayMeta?.ok ? (
        <p className="text-xs text-muted">
          Today here reads <span className="font-medium text-ink">{todayMeta.hijriLabel}</span> (
          {todayMeta.locationLabel}).
        </p>
      ) : null}

      <section className="rounded-[1.35rem] border border-black/[0.06] bg-[#F9F6F1]/90 p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-emerald-950">
            {displayMonthName} · {hijriYear}{" "}
            <span className="text-sm font-normal text-muted">AH</span>
          </h2>
          <span className="text-[0.65rem] text-muted whitespace-nowrap">
            {calendar?.locationLabel ?? "—"}
          </span>
        </div>
        {loading ? <p className="text-sm text-muted mt-4">Loading days…</p> : null}
        {err ? (
          <p className="text-sm text-rose-900 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
            {err}
          </p>
        ) : null}

        {calendar?.ok ? (
          <ul className="mt-5 space-y-2 max-h-[28rem] overflow-y-auto overscroll-contain touch-scroll-y">
            {calendar.days.map((d, i) => (
              <li
                key={`${d.gregorianReadable}-${i}`}
                className="flex justify-between gap-3 rounded-xl border border-black/[0.05] bg-white/60 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-display font-semibold text-ink">{d.hijriLabel}</p>
                  <p className="text-[0.7rem] text-muted mt-0.5">{d.gregorianReadable}</p>
                  {Array.isArray(d.hijriHolidays) && d.hijriHolidays.length ? (
                    <p className="text-[0.65rem] text-emerald-900/80 mt-1">
                      {d.hijriHolidays.join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="text-[0.7rem] text-muted text-right tabular-nums whitespace-nowrap">
                  {d.hijriMonthNum === 9 ? (
                    <span className="block text-emerald-900 font-medium">Ramadan</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="text-[0.65rem] text-muted mt-6 leading-relaxed">{APP_DISCLAIMER}</p>
      </section>

      {scaffold.length ? (
        <section className="rounded-[1.35rem] border border-black/[0.06] bg-white/70 p-5 space-y-3">
          <h3 className="font-display text-base font-semibold text-ink">Guidance markers</h3>
          <p className="text-xs text-muted leading-relaxed">
            Approximate scaffolding — affirm with your Imam and locality.
          </p>
          <ul className="space-y-2 text-sm text-muted">
            {scaffold.map((d) => (
              <li key={d.key} className="border-b border-black/[0.04] pb-2 last:border-0">
                <span className="font-medium text-ink">{d.labelEn}</span>
                {d.note ? <span className="block text-xs mt-0.5">{d.note}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-center">
        <Link href="/app/prayer" className="font-semibold text-accent underline-offset-4 hover:underline">
          Back to today&apos;s times
        </Link>
      </p>
    </div>
  );
}
