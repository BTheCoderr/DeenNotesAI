"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { VerseDto } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

export type QuranAudioTarget = {
  surah: number;
  ayah: number;
  verse: VerseDto;
  chapterLabel?: string;
};

type Props = {
  target: QuranAudioTarget | null;
  audioUrl: string | null;
  loading: boolean;
  error: string | null;
  onDismiss: () => void;
};

/**
 * Sticky floating player shell — mirrors a mini-player you’d persist above the tab bar in Expo.
 */
export function QuranStickyPlayer({
  target,
  audioUrl,
  loading,
  error,
  onDismiss,
}: Props) {
  const rm = useReducedMotion();
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !target) return;
    el.pause();
    setPlaying(false);
    if (audioUrl) {
      el.src = audioUrl;
      void el.load();
    }
    const onEnded = () => setPlaying(false);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("ended", onEnded);
    };
  }, [audioUrl, target]);

  if (!target) return null;

  const label =
    target.chapterLabel ??
    `Surah ${target.surah} · Ayah ${target.ayah}`;

  async function toggle() {
    const el = ref.current;
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

  return (
    <motion.div
      key={`${target.surah}:${target.ayah}`}
      initial={rm ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={rm ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "fixed z-[46] mx-auto flex w-[min(100%,28rem)] max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border border-black/[0.08] bg-surface/95 p-3 shadow-card backdrop-blur-md",
        "left-1/2 -translate-x-1/2",
        "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-8 md:right-8 md:left-auto md:translate-x-0",
      )}
      role="region"
      aria-label="Ayah audio"
    >
      <audio ref={ref} className="hidden" preload="none" />

      <div className="flex items-center gap-3">
        <motion.div
          key={audioUrl ?? "pending"}
          initial={rm ? false : { opacity: 0.88 }}
          animate={{ opacity: 1 }}
          transition={
            rm
              ? { duration: 0 }
              : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
          }
          className="flex min-w-0 flex-1 items-center gap-3"
        >
        <button
          type="button"
          disabled={loading || !audioUrl}
          onClick={() => void toggle()}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md transition hover:bg-accent-hover disabled:opacity-40",
          )}
          aria-label={playing ? "Pause audio" : "Play audio"}
        >
          {loading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin motion-reduce:animate-none" />
          ) : playing ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-ink">
            {label}
          </p>
          <p className="truncate text-[0.65rem] text-muted">
            {audioUrl
              ? "Streaming recitation preview"
              : error ?? "Fetching audio URL…"}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-muted hover:bg-mint/40 hover:text-accent"
          aria-label="Dismiss player"
        >
          ✕
        </button>
        </motion.div>
      </div>

      <div className="flex h-2 items-center rounded-full bg-mint/50 overflow-hidden">
        <span
          className="block h-full w-1/3 rounded-full bg-gradient-to-r from-accent/40 to-accent"
          aria-hidden
        />
      </div>
      <p className="text-[0.58rem] text-muted text-center uppercase tracking-wide">
        Player shell — waveform & seek bar can wire to real duration in Expo
      </p>
    </motion.div>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-current">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
