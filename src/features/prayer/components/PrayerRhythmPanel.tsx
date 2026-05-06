"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatCountdown } from "@/lib/prayer/next-prayer-client";
import type { PrayerTodayPayload } from "@/lib/prayer/types";

type Props = {
  data: PrayerTodayPayload | null;
  /** Today vs Prayer hub wording */
  momentTitle?: string;
  hubLink?: { href: string; label: string } | null;
};

/** Present-only prayer rhythm (current / next / countdown / Hijri + Gregorian line). */

export function PrayerRhythmPanel({
  data,
  momentTitle = "This moment",
  hubLink = { href: "/app/prayer", label: "Full prayer hub" },
}: Props) {
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdownMs = useMemo(() => {
    const t = data?.schedule?.nextAtEpochMs;
    if (t == null || !Number.isFinite(t)) return null;
    return Math.max(0, t - now);
  }, [data, now]);

  if (!data?.ok) return null;

  const { schedule } = data;
  const currentName = schedule.currentPrayer;
  const nextName = schedule.nextPrayer;
  const nextClock = data.timings[nextName] ?? "—";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[1.25rem] border border-emerald-950/10 bg-gradient-to-br from-[#F3EEE6] via-[#E8F2EC]/90 to-[#DFE9E4]/80 px-5 py-5 shadow-sm"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-800/10 blur-2xl"
        aria-hidden
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-950/55">
              Prayer
            </p>
            <h2 className="font-display text-xl font-semibold text-emerald-950 mt-1 leading-snug">
              {momentTitle}
            </h2>
          </div>
          {countdownMs != null ? (
            <p className="text-lg font-semibold tabular-nums text-emerald-900 pt-0.5">
              {formatCountdown(countdownMs)}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/[0.05] bg-white/50 px-4 py-3 backdrop-blur-sm">
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">Now</p>
            {currentName ? (
              <>
                <p className="font-display text-lg font-semibold text-ink mt-0.5">{currentName}</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{schedule.currentLabel}</p>
              </>
            ) : (
              <p className="text-sm text-muted mt-1 leading-relaxed">{schedule.currentLabel}</p>
            )}
          </div>
          <div className="rounded-2xl border border-emerald-950/12 bg-emerald-950/[0.06] px-4 py-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-emerald-950/70">
              Next
            </p>
            <p className="font-display text-lg font-semibold text-emerald-950 mt-0.5">{nextName}</p>
            <p className="text-sm tabular-nums text-emerald-900/90 mt-0.5">{nextClock}</p>
          </div>
        </div>

        <div className="rounded-xl border border-black/[0.04] bg-white/40 px-3 py-2.5">
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">Dates</p>
          <p className="text-sm text-ink mt-0.5">{data.gregorianDateReadable}</p>
          <p className="text-sm italic text-emerald-950/85 mt-0.5">Hijri · {data.hijriLabel}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <p className="text-[0.65rem] text-muted leading-relaxed max-w-[14rem]">
            {data.methodLabel} · {data.schoolLabel}
          </p>
          {hubLink ? (
            <Link
              href={hubLink.href}
              className="inline-flex rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-[#F9F6F1] hover:bg-emerald-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-950"
            >
              {hubLink.label}
            </Link>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
