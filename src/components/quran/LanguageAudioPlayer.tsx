"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { QURANENC_TERMS_URL } from "@/lib/quranenc/types";
import { cn } from "@/lib/utils";

type Props = {
  visible: boolean;
  ayahCaption: string;
  audioUrl: string | null;
  loading: boolean;
  error: string | null;
  attributionLine: string | null;
  translationKeyLabel?: string | null;
  onDismiss: () => void;
};

/**
 * QuranEnc translation narration — calm mini-player tuned for multilingual listening.
 */
export function LanguageAudioPlayer({
  visible,
  ayahCaption,
  audioUrl,
  loading,
  error,
  attributionLine,
  translationKeyLabel,
  onDismiss,
}: Props) {
  const rm = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !visible) return;
    el.pause();
    setPlaying(false);
    if (audioUrl) {
      el.src = audioUrl;
      void el.load();
    }
    const onEnded = () => setPlaying(false);
    el.addEventListener("ended", onEnded);
    return () => el.removeEventListener("ended", onEnded);
  }, [audioUrl, visible]);

  if (!visible) return null;

  async function toggle() {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  const statusLine = loading
    ? "Preparing narration…"
    : audioUrl
      ? `${translationKeyLabel ? `${translationKeyLabel} · ` : ""}translation audio`
      : error ?? "No audio resolved yet";

  return (
    <motion.div
      initial={rm ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        rm
          ? { duration: 0 }
          : { type: "spring", stiffness: 360, damping: 30 }
      }
      role="region"
      aria-label="Translation language audio"
      className={cn(
        "fixed z-[46] mx-auto flex w-[min(100%,28rem)] max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border border-accent/15 bg-gradient-to-b from-accent-soft/40 via-surface to-surface p-3.5 shadow-card backdrop-blur-md",
        "left-1/2 -translate-x-1/2",
        "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-8 md:left-auto md:right-8 md:translate-x-0",
      )}
    >
      <audio ref={audioRef} className="hidden" preload="none" />

      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={loading || !audioUrl}
          onClick={() => void toggle()}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md transition hover:bg-accent-hover disabled:opacity-35",
          )}
          aria-label={playing ? "Pause translation narration" : "Play translation narration"}
        >
          {loading ? (
            <span
              className={cn(
                "h-4 w-4 rounded-full border-2 border-white/40 border-t-white",
                !rm && "animate-spin",
              )}
              aria-hidden
            />
          ) : playing ? (
            <PauseGlyph />
          ) : (
            <PlayGlyph />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-ink">
            {ayahCaption}
          </p>
          <p className="mt-0.5 text-[0.66rem] text-muted leading-snug">
            {statusLine}
          </p>
          <a
            href={QURANENC_TERMS_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-[0.58rem] font-medium uppercase tracking-wide text-accent/90 underline-offset-2 hover:underline"
          >
            QuranEnc · terms & attribution
          </a>
          {attributionLine ? (
            <p className="mt-1.5 text-[0.58rem] leading-snug text-muted">
              {attributionLine}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-muted hover:bg-mint/40 hover:text-accent"
          aria-label="Dismiss audio"
        >
          ✕
        </button>
      </div>

      <div
        className="flex h-1.5 items-center overflow-hidden rounded-full bg-mint/55"
        aria-hidden
      >
        <motion.span
          className="block h-full w-1/3 rounded-full bg-gradient-to-r from-accent/45 to-accent"
          animate={
            rm ? { opacity: 0.95 } : playing
              ? { opacity: [0.65, 1, 0.65] }
              : { opacity: 0.95 }
          }
          transition={
            rm || !playing
              ? { duration: 0 }
              : { duration: 2.8, repeat: Infinity }
          }
        />
      </div>
    </motion.div>
  );
}

function PlayGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-current">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
