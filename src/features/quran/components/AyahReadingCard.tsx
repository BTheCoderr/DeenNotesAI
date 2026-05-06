"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import type { VerseDto } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

type Props = {
  verse: VerseDto;
  surahNumber: number;
  surahDisplayName?: string;
  highlighted: boolean;
  readingMode?: boolean;
  /** Calm Arabic-forward layout — hides translation clutter. */
  focusMode?: boolean;
  hasMarker?: boolean;
  hasFavorite?: boolean;
  onToggleMarker?: () => void;
  onToggleFavorite?: () => void;
  onOpenReflect?: () => void;
  onPinTafsirMoment?: () => void;
  onOpenTafsir: () => void;
  onListen: () => void;
};

export function AyahReadingCard({
  verse,
  surahNumber,
  surahDisplayName,
  highlighted,
  readingMode = false,
  focusMode = false,
  hasMarker = false,
  hasFavorite = false,
  onToggleMarker,
  onToggleFavorite,
  onOpenReflect,
  onPinTafsirMoment,
  onOpenTafsir,
  onListen,
}: Props) {
  const reduceMotion = useReducedMotion();
  const translationText = verse.translations?.[0]?.text?.trim() ?? "";

  async function handleCopy() {
    const blob = `${verse.textUthmani}\n${translationText}`.trim();
    try {
      await navigator.clipboard.writeText(blob);
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/app/quran/${surahNumber}/${verse.verseNumber}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${surahDisplayName ?? "Quran"} ${surahNumber}:${verse.verseNumber}`,
          text: translationText.slice(0, 200),
          url,
        });
        return;
      }
    } catch {
      /* dismissed */
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.article
      id={`ayah-${verse.verseNumber}`}
      translate="no"
      initial={false}
      animate={
        highlighted && !reduceMotion
          ? {
              boxShadow:
                "0 16px 48px rgba(18,122,99,0.14), 0 0 0 1px rgba(18,122,99,0.12)",
            }
          : {
              boxShadow:
                "0 1px 2px rgba(28, 27, 24, 0.05), 0 4px 14px rgba(28, 27, 24, 0.04)",
            }
      }
      transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "scroll-mt-[5.65rem] rounded-[1.35rem] border px-[1.1rem] py-5 transition-colors duration-ds will-change-transform",
        highlighted
          ? "border-accent/35 bg-gradient-to-br from-mint/40 via-accent-soft/25 to-surface ring-2 ring-accent/15 motion-safe:scale-[1.008] motion-reduce:scale-100"
          : "border-black/[0.06] bg-surface hover:border-accent/20 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none",
      )}
    >
      <div className="flex justify-between gap-2 items-start">
        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[0.7rem] font-bold tabular-nums text-accent">
          {verse.verseNumber}
        </span>
        <div className="flex items-center gap-1">
          <Link
            href={`/app/quran/${surahNumber}/${verse.verseNumber}`}
            className="rounded-full px-2 py-1 text-[0.65rem] font-semibold text-muted uppercase tracking-wide hover:bg-mint/40 hover:text-accent"
          >
            Focus
          </Link>
          <button
            type="button"
            onClick={onListen}
            className="rounded-full px-2 py-1 text-[0.65rem] font-semibold text-accent hover:bg-accent/10"
          >
            Listen
          </button>
        </div>
      </div>

      <p
        className={cn(
          "mt-4 text-right text-ink font-normal",
          readingMode
            ? "text-[1.44rem] sm:text-[1.58rem] leading-[2.42] tracking-[0.022em]"
            : "text-[1.2rem] sm:text-[1.35rem] leading-[2.18] tracking-[0.015em]",
          focusMode &&
            !readingMode &&
            "[word-spacing:0.06em] sm:[word-spacing:0.07em]",
          focusMode &&
            readingMode &&
            "[word-spacing:0.095em] sm:[word-spacing:0.11em]",
        )}
        dir="rtl"
        lang="ar"
        translate="no"
        style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
      >
        {verse.textUthmani || verse.textImlaei || "—"}
      </p>

      {!focusMode ? (
        verse.translations?.[0]?.text ? (
          <p className="mt-5 text-sm leading-[1.7] text-ink/85 border-l-2 border-accent/25 pl-3">
            {verse.translations[0].text}
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted italic">
            Translation will appear once a resource loads.
          </p>
        )
      ) : (
        <p className="mt-3 text-[0.65rem] text-muted uppercase tracking-[0.12em]">
          Translation paused in focus · tap Translate to soften back in
        </p>
      )}

      <div
        className={cn(
          "mt-5 flex flex-wrap gap-2",
          focusMode && "[&_button]:motion-safe:active:opacity-95",
        )}
      >
        {onToggleFavorite ? (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={hasFavorite ? "Remove favorite ayah" : "Favorite ayah"}
            aria-pressed={hasFavorite}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
              hasFavorite
                ? "border-accent/40 bg-accent/12 text-accent"
                : "border-black/12 bg-background text-ink hover:bg-mint/35",
            )}
          >
            {hasFavorite ? "Favorited" : "Favorite"}
          </button>
        ) : null}
        {onToggleMarker ? (
          <button
            type="button"
            onClick={onToggleMarker}
            aria-label={hasMarker ? "Remove ribbon marker" : "Ribbon marker ayah"}
            aria-pressed={hasMarker}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
              hasMarker
                ? "border-accent/40 bg-mint/50 text-accent"
                : "border-black/12 bg-background text-ink hover:bg-mint/35",
            )}
          >
            {hasMarker ? "Ribboned" : "Ribbon"}
          </button>
        ) : null}
        {onOpenReflect ? (
          <button
            type="button"
            onClick={onOpenReflect}
            className="rounded-full border border-accent/25 bg-accent/8 px-3.5 py-2 text-xs font-semibold text-accent hover:bg-accent/15 transition-colors"
          >
            Reflection
          </button>
        ) : null}
        {onPinTafsirMoment ? (
          <button
            type="button"
            onClick={onPinTafsirMoment}
            className="rounded-full border border-black/12 bg-background px-3 py-2 text-[0.7rem] font-semibold text-muted hover:text-accent transition-colors"
          >
            Pin tafsir
          </button>
        ) : null}
        <button
          type="button"
          onClick={onOpenTafsir}
          className="rounded-full bg-gradient-to-r from-accent/15 to-mint/50 px-4 py-2 text-xs font-semibold text-accent ring-1 ring-accent/25 hover:from-accent/25 hover:to-mint/60 transition-colors"
        >
          Tafsir
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="rounded-full border border-black/12 bg-background px-4 py-2 text-xs font-semibold text-ink hover:bg-mint/35 transition-colors"
        >
          Share ayah
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="rounded-full border border-black/12 bg-background px-4 py-2 text-xs font-semibold text-ink hover:bg-mint/35 transition-colors"
        >
          Copy
        </button>
        <Link
          href={`/app/new?type=quran_reflection&verseRef=${surahNumber}%3A${verse.verseNumber}`}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-accent-hover transition-colors"
        >
          Save to note
        </Link>
      </div>
    </motion.article>
  );
}
