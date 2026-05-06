"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { rememberContinueNoteId } from "@/lib/browser/continue-note";
import { rememberRecentNoteOpen } from "@/lib/browser/note-recent";
import { GlassPanel } from "@/components/ds/GlassPanel";
import { PremiumCard } from "@/components/ds/PremiumCard";
import { ShareCard } from "@/components/notes/ShareCard";
import { QuranAyahSheet, QuranReferencePills } from "@/features/quran";
import { labelForNoteType } from "@/lib/constants";
import { dsTransition } from "@/lib/ds-motion";
import { extractQuranRefsFromPlainText } from "@/lib/quran/extract-quran-refs";
import { QURAN_NOTE_REFERENCES_HINT } from "@/lib/quran/ui-copy";
import type { QuranRef } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

export type NoteDetailPayload = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
  summary: string;
  short_summary: string;
  main_reminder: string;
  key_reminders: string[];
  action_steps: string[];
  reflection_questions: string[];
  dua_prompts: string[];
  share_card_text: string;
  disclaimer: string;
  raw_input: string;
  /** Normalized citations from structured AI storage */
  quran_refs: QuranRef[];
};

type TabKey = "summary" | "actions" | "dua" | "reflection" | "share";

const TABS: { key: TabKey; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "actions", label: "Actions" },
  { key: "dua", label: "Dua" },
  { key: "reflection", label: "Reflect" },
  { key: "share", label: "Share" },
];

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h3 className="font-display text-[0.92rem] font-semibold tracking-wide uppercase text-accent/95">
        {title}
      </h3>
      <ul className="mt-3 space-y-2.5 text-[0.95rem] text-ink/90 leading-relaxed">
        {items.map((item, i) => (
          <li key={`${title}-${i}`} className="flex gap-3">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent shadow-sm shadow-accent/35" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NoteDetailScreen({ note }: { note: NoteDetailPayload }) {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<TabKey>("summary");
  const [chatOpen, setChatOpen] = useState(false);
  const [ayahDrawer, setAyahDrawer] = useState<{ s: number; a: number } | null>(
    null,
  );
  const ayahDrawerTargetRef = useRef<{ s: number; a: number } | null>(null);

  useEffect(() => {
    if (ayahDrawer) ayahDrawerTargetRef.current = ayahDrawer;
  }, [ayahDrawer]);

  const ayahDrawerTarget = ayahDrawer ?? ayahDrawerTargetRef.current;
  const ayahSheetEverOpened = ayahDrawerTargetRef.current !== null;
  const [discExpanded, setDiscExpanded] = useState(false);

  const shortSummary =
    (typeof note.short_summary === "string" && note.short_summary.trim()) ||
    note.summary?.trim() ||
    "";

  const trimmedShare = note.share_card_text.trim();
  const copySnippet =
    shortSummary.trim() ||
    (note.summary ?? "").slice(0, 500).trim() ||
    note.title;

  const mergedQuranRefs = useMemo(() => {
    const key = (r: QuranRef) => `${r.chapter}:${r.verse}`;
    const seen = new Set<string>();
    const out: QuranRef[] = [];

    for (const r of note.quran_refs) {
      const k = key(r);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }

    const fromText = extractQuranRefsFromPlainText(
      [
        note.raw_input,
        note.summary,
        note.short_summary,
        note.main_reminder,
        ...(note.key_reminders ?? []),
      ].join("\n"),
    );

    for (const r of fromText) {
      const k = key(r);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }
    return out;
  }, [
    note.key_reminders,
    note.main_reminder,
    note.quran_refs,
    note.raw_input,
    note.short_summary,
    note.summary,
  ]);

  const onShareNote = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const snippet = shortSummary.trim().slice(0, 240);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: note.title,
          text: snippet,
          url,
        });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          [note.title, snippet, url].filter(Boolean).join("\n\n"),
        );
      }
    } catch {
      /* ignore */
    }
  }, [note.title, shortSummary]);

  const dockBottom =
    "bottom-[calc(5.96rem+env(safe-area-inset-bottom))] md:bottom-10 md:pb-0 md:translate-y-2";

  useEffect(() => {
    rememberContinueNoteId(note.id);
    rememberRecentNoteOpen({
      id: note.id,
      title: note.title,
      openedAt: new Date().toISOString(),
    });
  }, [note.id, note.title]);

  return (
    <>
      <article className="relative isolate pb-[calc(9.75rem+env(safe-area-inset-bottom))] md:pb-36">
        <div className="pointer-events-none absolute -inset-x-16 top-[-4rem] h-48 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(18,122,99,0.12),transparent_65%)]" />

        <div className="relative flex items-start justify-between gap-3">
          <Link
            href="/app/notes"
            className="text-sm font-semibold text-accent hover:underline min-w-0"
          >
            ← Notes
          </Link>
        </div>

        <motion.header
          className="mt-6 relative"
          layout
          transition={dsTransition(!!reduceMotion, "sm")}
        >
          <span className="inline-flex rounded-full border border-accent/28 bg-gradient-to-r from-mint/45 to-mint/20 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-accent shadow-elev-1">
            {labelForNoteType(note.note_type)}
          </span>
          <motion.h1
            layout="position"
            className="font-display text-[1.8rem] sm:text-[2.15rem] font-semibold text-ink mt-4 leading-[1.15] tracking-tight"
          >
            {note.title}
          </motion.h1>
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted mt-3">
            {new Date(note.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

          {mergedQuranRefs.length ? (
            <QuranReferencePills
              className="mt-6 shadow-elev-2"
              animated
              refs={mergedQuranRefs}
              hint={QURAN_NOTE_REFERENCES_HINT}
              onSelect={(r) => setAyahDrawer({ s: r.chapter, a: r.verse })}
            />
          ) : null}
        </motion.header>

        {note.main_reminder ? (
          <motion.section
            initial={false}
            layout
            className="relative mt-7 overflow-hidden rounded-[1.4rem] border border-accent/25 bg-gradient-to-br from-accent-soft/55 via-mint/35 to-surface p-[1px] shadow-elev-2"
          >
            <div className="rounded-[1.35rem] bg-surface/90 px-6 py-5 backdrop-blur-sm">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
                Main reminder
              </p>
              <p className="mt-3 text-[1.15rem] sm:text-xl font-display font-medium text-ink leading-snug tracking-tight">
                {note.main_reminder}
              </p>
            </div>
          </motion.section>
        ) : null}

        <div className="mt-9">
          <LayoutGroup id="note-detail-tabs">
            <div className="-mx-1 flex gap-1 overflow-x-auto p-1 rounded-full bg-black/[0.035] scrollbar-none">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2.5 text-[0.7rem] font-bold tracking-tight transition-colors duration-ds",
                    tab === key ? "text-white" : "text-muted hover:text-ink",
                  )}
                >
                  {tab === key ? (
                    <motion.span
                      layoutId="note-detail-tab-fill"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-accent via-accent to-[#0f5c4a]"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  ) : null}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>

        <PremiumCard elevated="md" className="relative mt-5 overflow-hidden rounded-[1.35rem] p-px border-none bg-card-veil">
          <div className="rounded-[1.3rem] bg-surface/95 px-5 py-6 sm:px-7 sm:py-8 min-h-[13rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={
                  reduceMotion ? false : { opacity: 0, x: 10, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, x: -8, filter: "blur(3px)" }
                }
                transition={dsTransition(!!reduceMotion, "sm")}
              >
                {tab === "summary" ? (
                  <div>
                    <h2 className="font-display text-xl sm:text-[1.35rem] font-semibold text-ink tracking-tight">
                      Narrative arc
                    </h2>
                    <p className="mt-4 text-[1.01rem] sm:text-[1.045rem] text-ink/[0.92] leading-[1.75] whitespace-pre-wrap">
                      {shortSummary || "—"}
                    </p>
                    <ListSection title="Key reminders" items={note.key_reminders} />
                  </div>
                ) : null}

                {tab === "actions" ? (
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Grounded movement
                    </h2>
                    {note.action_steps.length ? (
                      <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-ink/90">
                        {note.action_steps.map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent text-xs font-bold">
                              {i + 1}
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-muted">No action steps listed.</p>
                    )}
                  </div>
                ) : null}

                {tab === "dua" ? (
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Dua whispers
                    </h2>
                    {note.dua_prompts.length ? (
                      <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-ink/90">
                        {note.dua_prompts.map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-accent font-bold shrink-0">·</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-muted">No dua prompts listed.</p>
                    )}
                  </div>
                ) : null}

                {tab === "reflection" ? (
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Heart questions
                    </h2>
                    {note.reflection_questions.length ? (
                      <ul className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-ink/90">
                        {note.reflection_questions.map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-muted">No prompts listed.</p>
                    )}
                  </div>
                ) : null}

                {tab === "share" ? (
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Shareable calm
                    </h2>
                    {trimmedShare ? (
                      <motion.div
                        layout
                        className="mt-5"
                        transition={dsTransition(!!reduceMotion, "md")}
                      >
                        <ShareCard
                          shareCardText={note.share_card_text}
                          noteId={note.id}
                          className="mt-0 shadow-elev-3 border border-white/40"
                        />
                      </motion.div>
                    ) : (
                      <p className="mt-4 text-sm text-muted">
                        No share card text for this note yet.
                      </p>
                    )}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </PremiumCard>

        <div className="mt-7 rounded-[1.25rem] border border-black/[0.06] bg-background/90 overflow-hidden">
          <button
            type="button"
            onClick={() => setDiscExpanded((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            aria-expanded={discExpanded}
          >
            <span className="font-display text-base font-semibold text-ink">
              Disclaimer
            </span>
            <motion.span
              animate={{ rotate: discExpanded ? 180 : 0 }}
              transition={dsTransition(!!reduceMotion, "xs")}
              className="text-muted text-sm"
              aria-hidden
            >
              ▼
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {discExpanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={dsTransition(!!reduceMotion, "md")}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-sm text-muted leading-relaxed whitespace-pre-wrap border-t border-black/[0.04] pt-4">
                  {note.disclaimer}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <details className="group mt-4 rounded-[1.25rem] border border-black/[0.06] bg-surface overflow-hidden shadow-elev-1">
          <summary className="cursor-pointer list-none px-5 py-4 font-display text-base font-semibold text-ink flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            Original notes
            <span className="text-xs text-muted transition-transform duration-ds group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-black/[0.04] px-5 pb-5 pt-4">
            <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
              {note.raw_input}
            </p>
          </div>
        </details>
      </article>

      <div
        className={cn(
          "fixed z-[48] inset-x-0 px-4 pointer-events-none max-w-2xl mx-auto w-full",
          dockBottom,
        )}
      >
        <GlassPanel className="pointer-events-auto flex items-stretch gap-2 p-2 shadow-elev-2 border border-white/40">
          <motion.button
            type="button"
            onClick={() => setChatOpen(true)}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
            className="flex-1 rounded-xl bg-gradient-to-br from-accent to-[#0f5c4a] px-3 py-3 text-left text-white shadow-elev-1 motion-reduce:active:opacity-95"
          >
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/80">
              Reflect
            </span>
            <span className="mt-0.5 block text-sm font-semibold leading-tight">
              Ask about this note
            </span>
          </motion.button>
          <div className="flex flex-col gap-1.5 w-[7.75rem] shrink-0">
            <motion.button
              type="button"
              onClick={() => void onShareNote()}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 520, damping: 32 }}
              className="rounded-xl border border-accent/25 bg-white/95 px-2 py-2 text-xs font-semibold text-accent hover:bg-mint/50 transition-colors duration-ds motion-reduce:active:opacity-90"
            >
              Share note
            </motion.button>
            <CopyButton
              text={copySnippet}
              idleLabel="Copy excerpt"
              className="!rounded-xl !border-black/12 !bg-white/90 !py-2 !text-xs !font-semibold !text-ink"
            />
          </div>
        </GlassPanel>
      </div>

      <AnimatePresence>
        {chatOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center md:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Ask about note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={dsTransition(!!reduceMotion, "sm")}
          >
            <motion.button
              type="button"
              aria-label="Close chat"
              className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
              onClick={() => setChatOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-surface rounded-t-[2rem] md:rounded-[2rem] shadow-elev-3 border border-black/10 max-h-[74dvh] w-full md:max-w-md flex flex-col overflow-hidden"
              initial={reduceMotion ? false : { y: 52, opacity: 0.85 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.36,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="h-1.5 w-12 rounded-full bg-black/15 mx-auto mt-3 mb-3 md:hidden" />
              <div className="px-5 py-4 border-b border-black/8 flex justify-between items-center gap-3 bg-surface/95 backdrop-blur-md">
                <p className="font-display font-semibold text-ink">Ask about this note</p>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="text-sm font-semibold text-muted hover:text-accent"
                >
                  Close
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted leading-relaxed">
                  Note chat is coming soon — until then copy a snippet below.
                </p>
                <CopyButton text={copySnippet} idleLabel="Copy summary snippet" />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {ayahSheetEverOpened && ayahDrawerTarget ? (
        <QuranAyahSheet
          open={!!ayahDrawer}
          surah={ayahDrawerTarget.s}
          ayah={ayahDrawerTarget.a}
          onClose={() => setAyahDrawer(null)}
        />
      ) : null}
    </>
  );
}
