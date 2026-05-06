"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  idbDeleteNoteRecording,
  idbLoadNoteRecording,
  idbPutNoteRecording,
} from "@/lib/browser/note-idb-recordings";
import type { RecordingStamp } from "@/lib/browser/note-idb-recordings";
import { cn } from "@/lib/utils";

type Props = { noteId: string; className?: string };

/**
 * Khutbah / lecture capture — timestamps jump playback; waveform is symbolic calm, not analytics.
 */
export function KhutbahRecordingPanel({ noteId, className }: Props) {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [error, setError] = useState<string | null>(null);
  const [stamps, setStamps] = useState<RecordingStamp[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startPerfRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stampsRef = useRef<RecordingStamp[]>([]);

  useEffect(() => {
    stampsRef.current = stamps;
  }, [stamps]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      const loaded = await idbLoadNoteRecording(noteId);
      if (cancel || !loaded) return;
      setBlob(loaded.blob);
      setStamps(loaded.stamps);
      setStatus("stopped");
      const u = URL.createObjectURL(loaded.blob);
      setUrl(u);
    })();
    return () => {
      cancel = true;
    };
  }, [noteId]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const persist = useCallback(
    async (nextBlob: Blob, nextStamps: RecordingStamp[]) => {
      await idbPutNoteRecording(noteId, nextBlob, nextStamps);
    },
    [noteId],
  );

  async function startRecording() {
    setError(null);
    setStamps([]);
    stampsRef.current = [];
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      startPerfRef.current = performance.now();
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const b = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        setBlob(b);
        setStatus("stopped");
        const u = URL.createObjectURL(b);
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return u;
        });
        void persist(b, stampsRef.current);
      };
      mr.start(220);
      setStatus("recording");
    } catch {
      setError("Microphone access is needed to capture khutbahs on-device.");
      setStatus("idle");
    }
  }

  function stopRecording() {
    const mr = mediaRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.stop();
    mediaRef.current = null;
  }

  function addStamp(label?: string) {
    if (status !== "recording") return;
    const atMs = Math.round(performance.now() - startPerfRef.current);
    setStamps((prev) => {
      const next = [
        ...prev,
        {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : String(prev.length + 1),
          atMs,
          label: label?.trim() || `Moment · ${prev.length + 1}`,
        },
      ];
      stampsRef.current = next;
      return next;
    });
  }

  function seekTo(sec: number) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, sec);
    void el.play().catch(() => {});
    setPlaying(true);
  }

  async function discard() {
    await idbDeleteNoteRecording(noteId);
    setBlob(null);
    setStamps([]);
    stampsRef.current = [];
    setStatus("idle");
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  return (
    <section
      className={cn(
        "rounded-[1.35rem] border border-accent/18 bg-gradient-to-br from-accent-soft/35 via-surface to-mint/25 p-5 shadow-inner",
        className,
      )}
      aria-label="Khutbah or Islamic lecture recording"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-accent">
            Khutbah / lecture capture
          </p>
          <p className="mt-1 text-sm text-muted leading-relaxed max-w-prose">
            Timestamps anchor emotional beats — tap during recording, then jump back while replaying.
            Audio stays on this device until you export.
          </p>
        </div>
        <WaveformPlaceholder active={status === "recording"} reduceMotion={!!reduceMotion} />
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-amber-950">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {status === "idle" || status === "stopped" ? (
          <button
            type="button"
            onClick={() => void startRecording()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
          >
            {blob ? "Re-record" : "Start recording"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => stopRecording()}
              className="rounded-full border border-black/14 bg-background px-5 py-2 text-sm font-semibold text-ink"
            >
              Stop
            </button>
            <button
              type="button"
              onClick={() => addStamp()}
              className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
            >
              Timestamp moment
            </button>
          </>
        )}
        {blob ? (
          <button
            type="button"
            onClick={() => void discard()}
            className="rounded-full px-4 py-2 text-xs font-semibold text-muted hover:bg-mint/40"
          >
            Discard audio
          </button>
        ) : null}
      </div>

      {status === "recording" ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-accent">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Recording in progress — stay unhurried; pause if you need stillness.
        </p>
      ) : null}

      {url ? (
        <div className="mt-5 space-y-3 rounded-2xl border border-black/[0.06] bg-surface/90 p-4">
          <audio
            ref={audioRef}
            src={url}
            className="w-full"
            controls
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
          {stamps.length ? (
            <ul className="space-y-2">
              {[...stamps]
                .sort((a, b) => a.atMs - b.atMs)
                .map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => seekTo(s.atMs / 1000)}
                      className="w-full rounded-xl border border-accent/14 bg-accent/6 px-3 py-2 text-left text-sm text-ink hover:bg-mint/40 transition-colors"
                    >
                      <span className="font-mono text-[0.7rem] text-muted tabular-nums">
                        {(s.atMs / 1000).toFixed(1)}s
                      </span>
                      <span className="ml-2 font-medium">{s.label ?? "Moment"}</span>
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">No timestamps — add beats on your next recording.</p>
          )}
        </div>
      ) : null}

      {playing && blob ? (
        <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[45] px-4 max-w-lg mx-auto pointer-events-none">
          <div className="pointer-events-auto rounded-2xl border border-white/55 bg-surface/95 px-4 py-2 text-xs text-muted shadow-elev-2 backdrop-blur-md flex items-center justify-between gap-2">
            <span className="font-semibold text-ink truncate">Listening back…</span>
            <WaveformPlaceholder active reduceMotion={!!reduceMotion} className="scale-75 origin-right" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function WaveformPlaceholder({
  active,
  reduceMotion,
  className,
}: {
  active: boolean;
  reduceMotion: boolean;
  className?: string;
}) {
  const bars = 11;
  return (
    <div className={cn("flex items-end gap-0.5 h-9 shrink-0", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-accent/45 block"
          animate={
            active && !reduceMotion
              ? {
                  scaleY: [0.55, 1 + (i % 3) * 0.08, 0.6],
                }
              : { scaleY: 0.72 }
          }
          transition={
            reduceMotion || !active
              ? { duration: 0 }
              : {
                  repeat: Infinity,
                  duration: 1.05 + i * 0.05,
                  ease: "easeInOut",
                }
          }
          style={{ originY: 1 }}
        />
      ))}
    </div>
  );
}
