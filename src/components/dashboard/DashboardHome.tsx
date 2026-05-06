"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { BetaFeedbackCta } from "@/components/dashboard/BetaFeedbackCta";
import {
  AnimatedList,
  GlassPanel,
  GradientHero,
  PremiumCard,
  SectionHeading,
  VersePill,
  animatedListItemVariants,
} from "@/components/ds";
import { APP_DISCLAIMER, labelForNoteType } from "@/lib/constants";
import { readContinueNoteId } from "@/lib/browser/continue-note";
import {
  getAyahHistoryPreview,
  getContinueReading,
  getListeningResume,
  getRecentSurahVisits,
  listQuranBookmarks,
} from "@/lib/browser/quran-memory";
import { readRecentNotes } from "@/lib/browser/note-recent";
import { getDailyAnchoredAyah } from "@/lib/daily-spotlight";
import {
  fadeUpVariants,
  listItemVariants,
  staggerContainerVariants,
} from "@/lib/ds-motion";
import type { QuranRef } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

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

function vibeLine() {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return "Carry what moved you at fajr into the day.";
  if (h >= 12 && h < 17) return "Pause here before the evening rush runs away with you.";
  if (h >= 17 && h < 22) return "Let Maghrib air hold your reminder for a breath.";
  return "The quiet hours honor slow, sincere reflection.";
}

function greetingLine() {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return "Assalamu alaikum · morning inwardness";
  if (h >= 12 && h < 17) return "Assalamu alaikum · midday reset";
  if (h >= 17 && h < 22) return "Assalamu alaikum · softer evening rhythms";
  return "Assalamu alaikum · night's gentle remembrance";
}

export function DashboardHome({ latest, recent }: Props) {
  const { openNewNoteMenu } = useNewNoteMenu();
  const reduceMotion = useReducedMotion();
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [privateRhythm, setPrivateRhythm] = useState<{
    cont: ReturnType<typeof getContinueReading>;
    listen: ReturnType<typeof getListeningResume>;
    surahs: ReturnType<typeof getRecentSurahVisits>;
    ayahs: ReturnType<typeof getAyahHistoryPreview>;
    pins: ReturnType<typeof listQuranBookmarks>;
    notes: ReturnType<typeof readRecentNotes>;
  } | null>(null);

  useEffect(() => {
    setResumeId(readContinueNoteId());
    setPrivateRhythm({
      cont: getContinueReading(),
      listen: getListeningResume(),
      surahs: getRecentSurahVisits(6),
      ayahs: getAyahHistoryPreview(5),
      pins: listQuranBookmarks().slice(0, 6),
      notes: readRecentNotes().slice(0, 8),
    });
  }, []);

  const anchor = useMemo(() => getDailyAnchoredAyah(), []);

  const preview =
    latest &&
    ((typeof latest.short_summary === "string" && latest.short_summary.trim()) ||
      (latest.summary && latest.summary.trim()) ||
      "");

  const continueTeaser =
    latest &&
    (latest.main_reminder?.trim().slice(0, 220) ||
      preview?.slice(0, 220) ||
      "Open your latest note — one reminder is enough for today.");

  const ayahs = useMemo(() => latest?.quran_refs?.slice(0, 8) ?? [], [latest]);

  const recentIds = useMemo(() => new Set(recent.map((n) => n.id)), [recent]);
  const showResume =
    resumeId &&
    resumeId !== latest?.id &&
    !recentIds.has(resumeId);

  const rhythmNotes = useMemo(() => {
    if (!privateRhythm?.notes.length) return [];
    const hide = new Set<string>();
    if (latest?.id) hide.add(latest.id);
    recent.forEach((r) => hide.add(r.id));
    if (resumeId) hide.add(resumeId);
    return privateRhythm.notes.filter((n) => !hide.has(n.id)).slice(0, 4);
  }, [privateRhythm?.notes, latest?.id, recent, resumeId]);

  const showPrivateRhythm =
    !!privateRhythm &&
    !!(privateRhythm.cont ||
      privateRhythm.listen ||
      privateRhythm.surahs.length > 0 ||
      privateRhythm.ayahs.length > 0 ||
      privateRhythm.pins.length > 0 ||
      rhythmNotes.length > 0);

  return (
    <div className="relative isolate">
      <div
        className="pointer-events-none absolute -inset-x-10 -top-8 h-[22rem] bg-hero-mesh opacity-90 motion-reduce:opacity-100"
        aria-hidden
      />
      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-36 h-56 w-56 rounded-full bg-accent/15 blur-[100px]"
          animate={{
            opacity: [0.28, 0.48, 0.34],
            scale: [0.94, 1.05, 0.94],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-36 h-56 w-56 rounded-full bg-accent/12 blur-[100px]"
        />
      )}

      <motion.div
        className="relative z-10 space-y-10 sm:space-y-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainerVariants(!!reduceMotion)}
      >
        <motion.header variants={fadeUpVariants(!!reduceMotion)} className="space-y-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
            Today&apos;s salaam
          </p>
          <h1 className="font-display text-[1.85rem] sm:text-[2.35rem] font-semibold text-ink leading-[1.12] tracking-tight">
            {greetingLine()}
          </h1>
          <p className="text-[0.95rem] text-muted leading-relaxed max-w-prose">
            {vibeLine()}
          </p>
        </motion.header>

        {showResume ? (
          <motion.div variants={fadeUpVariants(!!reduceMotion)}>
            <PremiumCard elevated="sm" interactive className="border-accent/18">
              <Link
                href={`/app/notes/${resumeId}`}
                className="block rounded-[inherit] bg-gradient-to-br from-accent-soft/45 via-surface to-background px-5 py-4 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent motion-safe:active:scale-[0.995] motion-reduce:active:scale-100"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
                  Continue where you left off
                </p>
                <p className="mt-2 text-sm text-ink/90 leading-relaxed">
                  Your last opened note is waiting — one gentle pass is often enough to re-root the
                  heart.
                </p>
                <span className="mt-3 inline-flex text-xs font-bold text-accent">
                  Resume note →
                </span>
              </Link>
            </PremiumCard>
          </motion.div>
        ) : null}

        {showPrivateRhythm && privateRhythm ? (
          <motion.section
            variants={fadeUpVariants(!!reduceMotion)}
            className="space-y-4 rounded-[1.45rem] border border-black/[0.06] bg-surface/92 p-5 sm:p-6 shadow-elev-1"
          >
            <SectionHeading
              eyebrow="Your quiet memory"
              title="The app remembers gently on this device"
              description="Bookmarks, reading pauses, and recitation rests — private until you opt into sync later."
              className="space-y-2"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {privateRhythm.cont?.surah ? (
                <PremiumCard elevated="sm" interactive className="border-accent/16">
                  <Link
                    href={
                      privateRhythm.cont.ayah
                        ? `/app/quran/${privateRhythm.cont.surah}/${privateRhythm.cont.ayah}`
                        : `/app/quran/${privateRhythm.cont.surah}`
                    }
                    className="block rounded-[inherit] bg-gradient-to-br from-accent-soft/40 via-surface to-background p-5 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
                      Continue reading
                    </p>
                    <p className="font-display text-lg font-semibold text-ink mt-2 leading-snug">
                      Surah {privateRhythm.cont.surah}
                      {privateRhythm.cont.ayah
                        ? ` · Ayah ${privateRhythm.cont.ayah}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted mt-3 leading-relaxed">
                      Return slowly — pacing is adab.
                    </p>
                    <span className="mt-3 inline-flex text-xs font-bold text-accent">
                      Open Mushaf →
                    </span>
                  </Link>
                </PremiumCard>
              ) : (
                <GlassPanel className="p-5 border-dashed border-accent/25 opacity-95">
                  <p className="text-sm text-muted leading-relaxed">
                    Open any surah; we&apos;ll memorize your verse line without judgment.
                  </p>
                  <Link
                    href="/app/quran"
                    className="mt-4 inline-flex text-xs font-bold text-accent hover:underline"
                  >
                    Browse Quran →
                  </Link>
                </GlassPanel>
              )}

              {privateRhythm.listen?.surah ? (
                <PremiumCard elevated="sm" interactive>
                  <Link
                    href={`/app/quran/${privateRhythm.listen.surah}/${privateRhythm.listen.ayah}`}
                    className="block rounded-[inherit] bg-gradient-to-br from-mint/45 via-surface to-background p-5 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
                      Continue listening
                    </p>
                    <p className="font-display text-lg font-semibold text-ink mt-2">
                      Ayah {privateRhythm.listen.surah}:{privateRhythm.listen.ayah}
                    </p>
                    <p className="text-xs text-muted mt-3 leading-relaxed">
                      Let hearing carry you back — even thirty seconds rewires tenderness.
                    </p>
                    <span className="mt-3 inline-flex text-xs font-bold text-accent">
                      Resume recitation →
                    </span>
                  </Link>
                </PremiumCard>
              ) : (
                <GlassPanel className="p-5">
                  <p className="text-sm text-muted leading-relaxed">
                    Tap Listen on any ayah; we&apos;ll keep a serene cue by the bedside of your heart.
                  </p>
                </GlassPanel>
              )}
            </div>

            {privateRhythm.surahs.length ? (
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted mb-3">
                  Recent surahs
                </p>
                <div className="flex flex-wrap gap-2">
                  {privateRhythm.surahs.map((s) => (
                    <Link
                      key={s.surah}
                      href={`/app/quran/${s.surah}`}
                      className="rounded-full border border-accent/25 bg-accent/8 px-3.5 py-1.5 text-xs font-bold text-accent tabular-nums hover:bg-accent/15 transition-colors duration-ds"
                    >
                      {s.surah}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {privateRhythm.ayahs.length ? (
              <div className="space-y-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
                  Recently glimpsed verses
                </p>
                <div className="flex flex-wrap gap-2">
                  {privateRhythm.ayahs.map((a) => (
                    <VersePill
                      key={`${a.surah}:${a.ayah}:${a.at}`}
                      surah={a.surah}
                      ayah={a.ayah}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {privateRhythm.pins.length ? (
              <div className="rounded-2xl border border-black/[0.05] bg-background/82 px-4 py-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent">
                      Saved ayat
                    </p>
                    <p className="text-sm text-ink mt-1">
                      Ribbons & favorites anchored on-device.
                    </p>
                  </div>
                  <Link
                    href="/app/quran/bookmarks"
                    className="text-xs font-bold text-accent hover:underline whitespace-nowrap"
                  >
                    Open shelf →
                  </Link>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {privateRhythm.pins.map((p) => (
                    <li key={p.id} className="flex justify-between gap-2 flex-wrap">
                      <Link
                        href={`/app/quran/${p.surah}/${p.ayah}`}
                        className="font-semibold text-ink hover:text-accent tabular-nums"
                      >
                        {p.surah}:{p.ayah}
                      </Link>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wide">
                        {p.kind}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {rhythmNotes.length ? (
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted mb-3">
                  Recently opened notes
                </p>
                <ul className="space-y-2">
                  {rhythmNotes.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/app/notes/${n.id}`}
                        className="block rounded-xl border border-black/[0.05] bg-surface px-4 py-2.5 text-sm font-display font-semibold text-ink hover:border-accent/25 transition-colors"
                      >
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </motion.section>
        ) : null}

        <motion.div variants={fadeUpVariants(!!reduceMotion)} className="space-y-4">
          <GradientHero glow>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
              Continue your thread
            </p>
            <p className="font-display text-xl sm:text-[1.35rem] leading-snug text-ink font-semibold max-w-xl mt-2">
              {latest
                ? latest.main_reminder?.trim() ||
                  preview?.slice(0, 180) ||
                  "Return to calm structure — tap below to revisit your voice."
                : "Your notebook glows when it mirrors the Qur'an and the sermons that pierced you."}
            </p>
            <p className="text-sm text-muted leading-relaxed pt-3 max-w-prose">
              {latest
                ? "A single thread from your last note — re-open the full reflection when you have two unhurried minutes."
                : "Begin with a rough line from the masjid, a ayah number, or half a dua — we humbly help you shape it."}
            </p>
          </GradientHero>

          <div className="grid gap-3 sm:grid-cols-2">
            <GlassPanel className="border-accent/15 p-5 shadow-elev-1">
              <SectionHeading
                eyebrow="Ayah anchor"
                title="Today&apos;s verse invite"
                description={anchor.cue}
                className="[&_h2]:text-base"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <VersePill surah={anchor.surah} ayah={anchor.ayah} />
                <Link
                  href={`/app/quran/${anchor.surah}/${anchor.ayah}`}
                  className="text-xs font-bold text-accent hover:underline underline-offset-4"
                >
                  Open in reader →
                </Link>
              </div>
            </GlassPanel>

            <PremiumCard elevated="sm" interactive className="border-accent/12">
              <button
                type="button"
                onClick={() => openNewNoteMenu()}
                className={cn(
                  "w-full text-left rounded-[inherit] bg-gradient-to-br from-mint/40 via-accent-soft/25 to-surface px-6 py-5",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
                  Today&apos;s reflection
                </p>
                <p className="font-display text-lg font-semibold text-ink mt-2 leading-snug">
                  One earnest paragraph tonight
                </p>
                <p className="text-sm text-muted mt-3 leading-relaxed">
                  Naming what stirred you—even clumsily—is how memory becomes practice. Tap to
                  capture while it hums quietly.
                </p>
              </button>
            </PremiumCard>
          </div>
        </motion.div>

        {latest ? (
          <motion.section variants={listItemVariants(!!reduceMotion)} className="space-y-3">
            <SectionHeading
              eyebrow="Continue"
              title="Pick up exactly where sincerity paused"
              description="Return rituals outperform novelty — tenderness compounds."
            />
            <PremiumCard elevated="lg" interactive>
              <Link
                href={`/app/notes/${latest.id}`}
                className="block rounded-[inherit] p-6 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex gap-4 items-start justify-between flex-wrap gap-y-2">
                  <div className="min-w-0 space-y-1">
                    <span className="inline-flex rounded-full border border-accent/25 bg-mint/40 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-accent">
                      {labelForNoteType(latest.note_type)}
                    </span>
                    <p className="font-display text-lg font-semibold text-ink line-clamp-2">
                      {latest.title}
                    </p>
                  </div>
                  <span className="text-[0.7rem] font-semibold text-muted tabular-nums shrink-0">
                    {new Date(latest.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {continueTeaser ? (
                  <p className="mt-4 text-sm text-muted leading-relaxed line-clamp-4">
                    {continueTeaser}
                    {continueTeaser.length >= 220 ? "…" : ""}
                  </p>
                ) : null}
                <span className="inline-flex mt-4 text-xs font-bold text-accent">
                  Continue reflection →
                </span>
              </Link>
            </PremiumCard>
          </motion.section>
        ) : null}

        {recent.length > 0 ? (
          <motion.section variants={fadeUpVariants(!!reduceMotion)} className="space-y-3">
            <SectionHeading
              eyebrow="Recent memory"
              title="Reflections you&apos;ve already shaped"
              description="Skim titles like calm museum labels — nothing here shouts for guilt."
            />
            <AnimatedList stagger className="space-y-3">
              {recent.map((n) => (
                <motion.li
                  key={n.id}
                  variants={animatedListItemVariants(!!reduceMotion)}
                >
                  <Link
                    href={`/app/notes/${n.id}`}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-black/[0.06] bg-surface/95 px-4 py-3.5 shadow-elev-1 transition-all duration-ds hover:border-accent/22 hover:shadow-elev-2"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-ink line-clamp-2">
                        {n.title}
                      </p>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-accent mt-1">
                        {labelForNoteType(n.note_type)}
                      </p>
                    </div>
                    <span className="text-[0.65rem] font-semibold text-muted tabular-nums shrink-0 pt-0.5">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </AnimatedList>
          </motion.section>
        ) : null}

        {ayahs.length > 0 ? (
          <motion.section variants={listItemVariants(!!reduceMotion)} className="space-y-3">
            <SectionHeading
              eyebrow="Quran echoes"
              title="Ayāt braided into your prose"
              description="Tiny bridges back to Mushaf posture — Arabic remains authoritative in-app."
            />
            <motion.div
              variants={staggerContainerVariants(!!reduceMotion)}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2"
            >
              {ayahs.map((r) => (
                <motion.div
                  key={`${r.chapter}:${r.verse}`}
                  variants={listItemVariants(!!reduceMotion)}
                >
                  <VersePill surah={r.chapter} ayah={r.verse} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        ) : null}

        <motion.section
          variants={fadeUpVariants(!!reduceMotion)}
          className="rounded-[1.45rem] border border-black/[0.07] bg-gradient-to-br from-surface via-background to-accent-soft/20 p-6 space-y-2 shadow-inner"
        >
          <p className="text-sm text-muted leading-relaxed">
            Headspace softness · Quran.com fidelity · journaling calm — this home is built for
            reflection, not dashboards.
          </p>
        </motion.section>

        <motion.div variants={fadeUpVariants(!!reduceMotion)}>
          <button
            type="button"
            onClick={() => openNewNoteMenu()}
            className="w-full rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-elev-fab hover:bg-accent-hover transition-colors duration-ds motion-safe:active:scale-[0.99]"
          >
            Create DeenNote
          </button>
        </motion.div>

        <motion.footer
          variants={fadeUpVariants(!!reduceMotion)}
          className="space-y-3 pb-[max(5rem,calc(env(safe-area-inset-bottom)+5rem))] md:pb-8 text-[0.7rem] text-muted leading-relaxed max-w-prose"
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
