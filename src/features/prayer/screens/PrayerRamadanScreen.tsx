"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildPrayerFetchQuery, type GeoPosition } from "@/features/prayer/build-prayer-fetch-query";
import { readPrayerPrefs } from "@/lib/browser/prayer-prefs";
import { APP_DISCLAIMER } from "@/lib/constants";
import { formatCountdown } from "@/lib/prayer/next-prayer-client";
import type { PrayerCalendarPayload, PrayerHijriCalendarPayload, PrayerTodayPayload } from "@/lib/prayer/types";

type RamadanApi = {
  ok: boolean;
  hijriYear?: number;
  gregorianMonth?: number | null;
  gregorianYear?: number | null;
  hijriRamadan?: PrayerHijriCalendarPayload | null;
  gregorianOverlap?: PrayerCalendarPayload | null;
  error?: string;
};

async function coarseGeo(): Promise<GeoPosition> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((g) => resolve(g), () => resolve(null), {
      enableHighAccuracy: false,
      maximumAge: 120_000,
      timeout: 10_000,
    });
  });
}

export function PrayerRamadanScreen() {
  const [prefs] = useState(() => readPrayerPrefs());
  const [geo, setGeo] = useState<GeoPosition>(null);
  const [today, setToday] = useState<PrayerTodayPayload | null>(null);
  const [ramadan, setRamadan] = useState<RamadanApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let g = geo;
      if (prefs.useBrowserLocation && !g) {
        g = await coarseGeo();
        setGeo(g);
      }
      const qs = buildPrayerFetchQuery(prefs, g);
      const [tRes, rRes] = await Promise.all([
        fetch(`/api/prayer/today?${qs}`, { cache: "no-store" }),
        fetch(`/api/prayer/ramadan?${qs}`, { cache: "no-store" }),
      ]);
      const tJson = (await tRes.json()) as PrayerTodayPayload | { ok?: false };
      const rJson = (await rRes.json()) as RamadanApi;

      if (tRes.ok && tJson && typeof tJson === "object" && "schedule" in tJson && tJson.ok) {
        setToday(tJson);
      } else {
        setToday(null);
      }
      setRamadan(rJson.ok ? rJson : null);
    } catch {
      setToday(null);
      setRamadan(null);
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

  const iftarEta = useMemo(() => {
    const iso = today?.timingsIso?.Maghrib;
    if (!iso?.includes("T")) return null;
    const maghribAt = Date.parse(iso);
    if (!Number.isFinite(maghribAt) || maghribAt <= now) return null;
    return maghribAt - now;
  }, [today, now]);

  const suhoorLine = today?.timings.Fajr ? `Quiet close to Fajr · ${today.timings.Fajr}` : null;

  return (
    <div className="max-w-lg mx-auto space-y-8 pb-28">
      <header className="space-y-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/80">
          Ramadan
        </p>
        <h1 className="font-display text-[1.85rem] font-semibold text-ink leading-tight">
          A slower pace
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Fasting windows are reminders, not judgments. Honor your energy and your scholars.
        </p>
      </header>

      {loading ? <p className="text-sm text-muted">Gathering Ramadan frame…</p> : null}

      {today?.isRamadanDay ? (
        <p className="rounded-2xl border border-emerald-900/12 bg-emerald-950/[0.05] px-4 py-3 text-sm text-emerald-950">
          May this day {today.ramadanDay ? `(day ${today.ramadanDay}) ` : ""}be light on your limbs and
          rich in tenderness.
        </p>
      ) : (
        <p className="text-sm text-muted leading-relaxed">
          The Hijri month shown in your locality may not be Ramadan yet — calendars differ by moon
          sighting. Treat this screen as companionship during the holy month whenever it arrives where
          you are.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-black/[0.06] bg-gradient-to-b from-[#F4F0E8] to-white p-5 space-y-2 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
            Suhoor close
          </p>
          <p className="font-display text-lg font-semibold text-ink">Fajr boundary</p>
          <p className="text-sm text-muted leading-relaxed">{suhoorLine ?? "Open Today for times."}</p>
        </div>
        <div className="rounded-[1.25rem] border border-emerald-950/12 bg-emerald-950/[0.07] p-5 space-y-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-900/70">
            Iftar
          </p>
          <p className="font-display text-lg font-semibold text-emerald-950">Maghrib</p>
          <p className="text-2xl font-semibold tabular-nums text-emerald-900">
            {iftarEta != null ? formatCountdown(iftarEta) : "—"}
          </p>
          {today?.timings.Maghrib ? (
            <p className="text-xs text-emerald-900/80">Approx. {today.timings.Maghrib}</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-black/[0.06] bg-white/70 p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Tonight&apos;s rhythm</h2>
        <p className="text-sm text-muted leading-relaxed">
          Taraweeh reminders will arrive with notifications — for now, hold a gentle intention.
        </p>
        <div className="rounded-2xl border border-dashed border-emerald-950/20 bg-stone-50/80 px-4 py-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-900/60">
            Ramadan reflection
          </p>
          <p className="text-sm text-muted leading-relaxed">
            One short note after Fajr or after taraweeh — not to optimize, but to remember.
          </p>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-[#F9F6F1]/80 px-4 py-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Tonight&apos;s ayah</p>
          <p className="text-sm text-muted leading-relaxed">
            Open the Qur&apos;an reader when you are ready — we keep your place on this device.
          </p>
          <Link
            href="/app/quran"
            className="inline-flex text-xs font-bold text-accent underline-offset-4 hover:underline"
          >
            Browse mushaf →
          </Link>
        </div>
        <div className="rounded-2xl border border-black/[0.06] px-4 py-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Post-taraweeh notes</p>
          <p className="text-sm text-muted leading-relaxed">
            If an ayah stayed with you, capture it without pressure — DeenNotes is a quiet shelf.
          </p>
          <Link
            href="/app/new"
            className="inline-flex text-xs font-bold text-accent underline-offset-4 hover:underline"
          >
            New reflection →
          </Link>
        </div>
      </section>

      {ramadan?.hijriRamadan?.days?.length ? (
        <section className="rounded-[1.35rem] border border-black/[0.06] bg-[#F9F6F1]/90 p-5 space-y-3">
          <h3 className="font-display text-base font-semibold text-ink">Ramadan calendar (Hijri 9)</h3>
          <p className="text-xs text-muted">
            Gregorian overlap {ramadan.gregorianMonth ?? "—"} / {ramadan.gregorianYear ?? "—"}
          </p>
          <ul className="max-h-60 overflow-y-auto space-y-1.5 text-sm">
            {ramadan.hijriRamadan.days.slice(0, 10).map((d, i) => (
              <li key={i} className="flex justify-between gap-2 text-muted border-b border-black/[0.04] pb-1.5">
                <span className="text-ink font-medium">{d.hijriLabel}</span>
                <span className="tabular-nums text-xs">{d.gregorianReadable}</span>
              </li>
            ))}
            <li className="text-xs text-muted pt-2">
              Full month in{" "}
              <Link href="/app/prayer/calendar" className="font-semibold text-accent underline-offset-4 hover:underline">
                Calendar
              </Link>
              .
            </li>
          </ul>
        </section>
      ) : null}

      <p className="text-[0.7rem] text-muted leading-relaxed">{APP_DISCLAIMER}</p>
    </div>
  );
}
