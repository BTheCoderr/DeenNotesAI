"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  quranFetchErrorForApp,
  splitQuranApiJson,
} from "@/lib/quran/api-contract";
import type { VerseDto } from "@/lib/quran/types";
import { readPreferredTranslationIds } from "@/lib/quran/translation-preference";
import { dsTransition } from "@/lib/ds-motion";
import {
  QURAN_REFLECTION_FOOTER,
  QURAN_TAFSIR_PREVIEW_HINT,
} from "@/lib/quran/ui-copy";
import { cn } from "@/lib/utils";

export type QuranAyahSheetProps = {
  open: boolean;
  onClose: () => void;
  surah: number;
  ayah: number;
};

/**
 * Bottom sheet (mobile) / end drawer (desktop) for ayah detail + tafsir.
 * Mirrors the shape you’d mount in Expo as a `BottomSheetModal`.
 */
export function QuranAyahSheet({
  open,
  onClose,
  surah,
  ayah,
}: QuranAyahSheetProps) {
  const reduceMotion = useReducedMotion();
  const [verse, setVerse] = useState<VerseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tid = readPreferredTranslationIds();
      const translationPart = tid
        ? `?translations=${encodeURIComponent(tid)}`
        : "";
      const res = await fetch(
        `/api/quran/verses/${surah}/${ayah}${translationPart}`,
        { cache: "no-store" },
      );
      let raw: unknown;
      try {
        raw = await res.json();
      } catch {
        raw = null;
      }
      if (!res.ok) {
        setError(quranFetchErrorForApp(raw));
        setVerse(null);
        return;
      }
      const { data } = splitQuranApiJson<{ verse?: VerseDto | null }>(raw);
      if (!data.verse) {
        setError("We couldn’t load this ayah.");
        setVerse(null);
        return;
      }
      setVerse(data.verse);
    } catch {
      setError("Network error.");
      setVerse(null);
    } finally {
      setLoading(false);
    }
  }, [ayah, surah]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key={`ayah-sheet-${surah}-${ayah}`}
          className="fixed inset-0 z-[70] md:flex md:items-stretch md:justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Quran ${surah}:${ayah}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={dsTransition(!!reduceMotion, "sm")}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm motion-reduce:backdrop-blur-none"
            aria-label="Close sheet"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={dsTransition(!!reduceMotion, "xs")}
          />

          <motion.div
            className={cn(
              "relative mt-auto flex max-h-[92dvh] w-full flex-col rounded-t-[1.75rem] border border-black/10 bg-gradient-to-b from-surface to-background shadow-[0_-16px_48px_rgba(28,27,24,0.14)] md:mt-0 md:max-h-none md:h-full md:max-w-md md:rounded-none md:border-l md:border-t-0 md:shadow-card",
            )}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 36, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 22, scale: 0.992 }
            }
            transition={
              reduceMotion
                ? dsTransition(true, "sm")
                : { type: "spring", stiffness: 420, damping: 34 }
            }
          >
            <div className="flex justify-center pt-2 pb-0.5 md:hidden">
              <span className="h-1 w-11 rounded-full bg-black/12" aria-hidden />
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 md:bg-surface/95 md:backdrop-blur-md md:sticky md:top-0 md:z-10">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent">
                  Tafsir & context
                </p>
                <p className="font-display text-lg font-semibold text-ink mt-0.5">
                  Surah {surah} · Ayah {ayah}
                </p>
                <p className="text-[0.65rem] text-muted mt-1 max-w-[18rem] leading-snug">
                  {QURAN_TAFSIR_PREVIEW_HINT}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-black/12 bg-background/80 px-3.5 py-2 text-xs font-semibold text-muted hover:border-accent/30 hover:text-accent"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto touch-scroll-y px-5 py-5 pb-28 md:pb-10">
              {loading ? (
                <div className="space-y-4">
                  <div
                    className="h-28 rounded-2xl bg-gradient-to-r from-mint/30 via-accent-soft/45 to-mint/30 bg-[length:220%_100%] animate-ds-shimmer motion-reduce:animate-none"
                    aria-hidden
                  />
                  <div
                    className="h-24 rounded-2xl bg-gradient-to-r from-black/[0.04] via-black/[0.07] to-black/[0.04] bg-[length:220%_100%] animate-ds-shimmer motion-reduce:animate-none"
                    aria-hidden
                  />
                </div>
              ) : error ? (
                <p className="rounded-2xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900">
                  {error}
                </p>
              ) : verse ? (
                <div className="space-y-6 motion-safe:animate-quran-soft-in motion-reduce:animate-none">
                  <p
                    className="text-right text-[1.35rem] leading-[2.12] text-ink sm:text-xl tracking-[0.02em]"
                    dir="rtl"
                    lang="ar"
                    translate="no"
                    style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
                  >
                    {verse.textUthmani || verse.textImlaei || "—"}
                  </p>

                  {verse.translations?.[0]?.text ? (
                    <section className="rounded-2xl border border-black/[0.06] bg-surface px-4 py-4 shadow-sm">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                        Translation
                      </p>
                      <p className="mt-2 text-sm text-ink/90 leading-relaxed">
                        {verse.translations[0].text}
                      </p>
                    </section>
                  ) : null}

                  <section className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-soft/35 via-mint/20 to-surface px-4 py-4 shadow-sm">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                      {verse.tafsirs?.[0]?.resourceName
                        ? `Tafsir · ${verse.tafsirs[0].resourceName}`
                        : "Tafsir preview"}
                    </p>
                    {verse.tafsirs?.[0]?.text ? (
                      <>
                        <p className="mt-2 text-[0.7rem] text-muted leading-snug">
                          {QURAN_TAFSIR_PREVIEW_HINT}
                        </p>
                        <p className="mt-3 text-sm text-ink/90 leading-relaxed whitespace-pre-wrap">
                          {verse.tafsirs[0].text.slice(0, 5000)}
                          {verse.tafsirs[0].text.length > 5000 ? "…" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-muted italic">
                        No tafsir excerpt with the resources currently selected — try opening this ayah again after refresh.
                      </p>
                    )}
                  </section>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/app/quran/${surah}/${ayah}`}
                      className="inline-flex justify-center rounded-full border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/15 transition-colors"
                    >
                      Focus in reader
                    </Link>
                    <Link
                      href={`/app/new?type=quran_reflection&verseRef=${encodeURIComponent(`${surah}:${ayah}`)}`}
                      className="inline-flex justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-accent-hover transition-colors"
                    >
                      Save ayah to note
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">No verse loaded.</p>
              )}

              <p className="mt-8 text-[0.65rem] text-muted leading-relaxed">
                {QURAN_REFLECTION_FOOTER}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
