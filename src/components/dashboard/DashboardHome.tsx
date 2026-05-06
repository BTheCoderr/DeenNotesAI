"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { BetaFeedbackCta } from "@/components/dashboard/BetaFeedbackCta";
import { QuietPrompt } from "@/components/spiritual/QuietPrompt";
import { GlassPanel, SectionHeading, VersePill } from "@/components/ds";
import { TodayPrayerSection } from "@/features/prayer/components/TodayPrayerSection";
import { APP_DISCLAIMER, labelForNoteType } from "@/lib/constants";
import { readContinueNoteId } from "@/lib/browser/continue-note";
import { getAyahHistoryPreview, getContinueReading } from "@/lib/browser/quran-memory";
import { getDailyAnchoredAyah } from "@/lib/daily-spotlight";
import {
  fadeUpVariants,
  listItemVariants,
  staggerContainerVariants,
} from "@/lib/ds-motion";
import type { QuranRef } from "@/lib/quran/types";

export type DashboardLatestNote = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
  short_summary: string | null;
  summary: string | null;
  main_reminder: string;
  quran_refs: QuranRef[];
} | null;

export type DashboardRecentNote = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
};

type Props = {
  latest: DashboardLatestNote;
  recent: DashboardRecentNote[];
};

function greetingLine() {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return "Assalamu alaikum · gentle morning";
  if (h >= 12 && h < 17) return "Assalamu alaikum · midday pause";
  if (h >= 17 && h < 22) return "Assalamu alaikum · softer evening";
  return "Assalamu alaikum · night's quiet";
}

export function DashboardHome({ latest, recent }: Props) {
  const { openNewNoteMenu } = useNewNoteMenu();
  const reduceMotion = useReducedMotion();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [continueRead, setContinueRead] = useState<ReturnType<
    typeof getContinueReading
  > | null>(null);
  const [lastAyah, setLastAyah] = useState<
    ReturnType<typeof getAyahHistoryPreview>[number] | null
  >(null);

  useEffect(() => {
    setResumeId(readContinueNoteId());
    setContinueRead(getContinueReading());
    const ay = getAyahHistoryPreview(1);
    setLastAyah(ay[0] ?? null);
  }, []);

  const anchor = useMemo(() => getDailyAnchoredAyah(), []);

  const preview =
    latest &&
    ((typeof latest.short_summary === "string" && latest.short_summary.trim()) ||
      (latest.summary && latest.summary.trim()) ||
      "");

  const continueTeaser =
    latest &&
    (latest.main_reminder?.trim().slice(0, 200) ||
      preview?.slice(0, 200) ||
      "Open your latest reflection when you have a calm moment.");

  const recentIds = useMemo(() => new Set(recent.map((n) => n.id)), [recent]);
  const showResume =
    resumeId && resumeId !== latest?.id && !recentIds.has(resumeId);

  return (
    <div className="relative isolate space-y-12 pb-[max(6rem,calc(env(safe-area-inset-bottom)+6rem))] md:pb-10 md:space-y-10">
      <motion.div
        className="relative z-10 flex flex-col gap-12 md:gap-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainerVariants(!!reduceMotion)}
      >
        <motion.header variants={fadeUpVariants(!!reduceMotion)} className="space-y-3">
          <h1 className="font-display text-[1.9rem] md:text-[2rem] font-semibold text-ink leading-tight tracking-tight">
            {greetingLine()}
          </h1>
          <p className="text-[0.8rem] text-muted leading-relaxed max-w-md">
            {APP_DISCLAIMER}
          </p>
        </motion.header>

        <motion.div variants={fadeUpVariants(!!reduceMotion)} className="space-y-5">
          <TodayPrayerSection />
        </motion.div>

        <motion.div variants={fadeUpVariants(!!reduceMotion)}>
          <QuietPrompt />
        </motion.div>

        {showResume ? (
          <motion.div variants={fadeUpVariants(!!reduceMotion)}>
            <Link
              href={`/app/notes/${resumeId}`}
              className="block rounded-2xl border border-accent/20 bg-accent-soft/35 px-5 py-4 text-left shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:active:scale-[0.995]"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent">
                Continue reflection
              </p>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Pick up the last note you opened on this device.
              </p>
              <span className="mt-2 inline-flex text-xs font-bold text-accent">
                Resume →
              </span>
            </Link>
          </motion.div>
        ) : null}

        <motion.section variants={fadeUpVariants(!!reduceMotion)} className="space-y-4">
          <GlassPanel className="p-5 md:p-6 border-black/[0.06]">
            <SectionHeading
              eyebrow="Quran"
              title="Today&apos;s ayah"
              description="One verse anchor — open the mushaf gently when ready."
              className="space-y-1.5 [&_h2]:text-[1.1rem]"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <VersePill surah={anchor.surah} ayah={anchor.ayah} />
              <Link
                href={`/app/quran/${anchor.surah}/${anchor.ayah}`}
                className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors"
              >
                Read in calm mode →
              </Link>
            </div>
          </GlassPanel>
        </motion.section>

        <motion.section variants={fadeUpVariants(!!reduceMotion)} className="space-y-4">
          <GlassPanel className="p-5 md:p-6 border-black/[0.06]">
            <SectionHeading
              eyebrow="Quran continuity"
              title="Continue reading"
              description={
                continueRead?.surah
                  ? `Paused at Surah ${continueRead.surah}${
                      continueRead.ayah ? ` · Ayah ${continueRead.ayah}` : ""
                    }`
                  : lastAyah
                    ? `Recently glanced ${lastAyah.surah}:${lastAyah.ayah}`
                    : "Open any surah once — we quietly hold your place on this device."
              }
              className="space-y-1.5 [&_h2]:text-[1.1rem]"
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {continueRead?.surah ? (
                <Link
                  href={
                    continueRead.ayah
                      ? `/app/quran/${continueRead.surah}/${continueRead.ayah}`
                      : `/app/quran/${continueRead.surah}`
                  }
                  className="inline-flex rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
                >
                  Continue →
                </Link>
              ) : null}
              <Link
                href="/app/quran"
                className="inline-flex rounded-full border border-black/12 px-4 py-2 text-xs font-semibold text-ink hover:bg-background"
              >
                Browse surahs
              </Link>
            </div>
          </GlassPanel>
        </motion.section>

        {latest ? (
          <motion.section variants={listItemVariants(!!reduceMotion)} className="space-y-4">
            <SectionHeading
              eyebrow="Reflect"
              title="Recent reflection"
              description="Warm recall — novelty can wait."
            />
            <Link
              href={`/app/notes/${latest.id}`}
              className="block rounded-2xl border border-black/[0.06] bg-surface p-5 md:p-6 shadow-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent hover:border-accent/20 transition-colors"
            >
              <span className="inline-flex rounded-full border border-accent/25 bg-mint/35 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-accent">
                {labelForNoteType(latest.note_type)}
              </span>
              <p className="font-display text-lg font-semibold text-ink mt-3 line-clamp-2">
                {latest.title}
              </p>
              {continueTeaser ? (
                <p className="text-sm text-muted mt-3 leading-relaxed line-clamp-3">
                  {continueTeaser}
                  {continueTeaser.length >= 200 ? "…" : ""}
                </p>
              ) : null}
              <span className="inline-flex mt-3 text-xs font-bold text-accent">
                Open →
              </span>
            </Link>
          </motion.section>
        ) : (
          <motion.div variants={fadeUpVariants(!!reduceMotion)}>
            <button
              type="button"
              onClick={() => openNewNoteMenu()}
              className="w-full rounded-2xl border border-dashed border-accent/35 bg-accent-soft/20 px-5 py-6 text-left hover:bg-accent-soft/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <p className="font-display text-lg font-semibold text-ink">
                Begin a reflection when you&apos;re ready
              </p>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                Thoughts do not need to be polished — this is just a peaceful shelf on your phone.
              </p>
            </button>
          </motion.div>
        )}

        {recent.length > 0 ? (
          <motion.section variants={fadeUpVariants(!!reduceMotion)} className="space-y-3">
            <SectionHeading eyebrow="Recall" title="Earlier reflections" />
            <ul className="space-y-2">
              {recent.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/app/notes/${n.id}`}
                    className="flex justify-between gap-3 rounded-xl border border-black/[0.06] bg-background/80 px-4 py-3 text-sm font-display font-semibold text-ink hover:border-accent/22"
                  >
                    <span className="line-clamp-1">{n.title}</span>
                    <span className="text-[0.65rem] text-muted tabular-nums shrink-0">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        ) : null}

        <motion.footer
          variants={fadeUpVariants(!!reduceMotion)}
          className="text-[0.7rem] text-muted leading-relaxed space-y-3 pt-4"
        >
          <p>{APP_DISCLAIMER}</p>
          <p className="text-sm [&_a]:font-semibold [&_a]:text-accent [&_a]:hover:underline">
            <BetaFeedbackCta />
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
