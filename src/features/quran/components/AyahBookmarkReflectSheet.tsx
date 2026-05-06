"use client";

import { useEffect, useState } from "react";

import { BottomSheet } from "@/components/ds/BottomSheet";
import type { QuranBookmarkStored } from "@/lib/browser/quran-memory";
import { addOrUpdateBookmark } from "@/lib/browser/quran-memory";

type Props = {
  open: boolean;
  onClose: () => void;
  /** When set, hydrate form for edits */
  initial?: QuranBookmarkStored | null;
  surah: number;
  ayah: number;
  onSaved?: () => void;
};

/**
 * Lightweight on-device bookmark note — tenderness over velocity; never hits Supabase unless you extend it later.
 */
export function AyahBookmarkReflectSheet({
  open,
  onClose,
  initial,
  surah,
  ayah,
  onSaved,
}: Props) {
  const [reflection, setReflection] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!open) return;
    setReflection(initial?.reflection ?? "");
    setTag(initial?.tags?.[0] ?? "");
  }, [open, initial, surah, ayah]);

  function save() {
    addOrUpdateBookmark({
      surah,
      ayah,
      kind: "reflection",
      reflection: reflection.trim(),
      tags: tag.trim() ? [tag.trim().slice(0, 48)] : [],
    });
    onSaved?.();
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} zClass="z-[72]">
      <div className="max-h-[min(78dvh,32rem)] flex flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex justify-center pt-1 pb-2 md:hidden">
          <span className="h-1 w-11 rounded-full bg-black/12" aria-hidden />
        </div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
          Gentle bookmark
        </p>
        <p className="font-display text-lg font-semibold text-ink mt-1">
          Surah {surah} · Ayah {ayah}
        </p>
        <p className="text-xs text-muted mt-2 leading-relaxed">
          Capture a sincerity line — this stays privately on your device unless you sync later from
          settings.
        </p>
        <label className="mt-5 block space-y-1.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
            Reflection whisper
          </span>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-black/[0.08] bg-surface px-4 py-3 text-sm text-ink outline-none ring-accent/25 focus-visible:ring-2"
            placeholder="What stirred you?"
          />
        </label>
        <label className="mt-3 block space-y-1.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
            Optional tag
          </span>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full rounded-2xl border border-black/[0.08] bg-surface px-4 py-2.5 text-sm text-ink outline-none ring-accent/25 focus-visible:ring-2"
            placeholder="e.g. tarawih"
          />
        </label>
        <button
          type="button"
          onClick={() => save()}
          className="mt-6 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white shadow-elev-1 hover:bg-accent-hover transition-colors duration-ds"
        >
          Save on this device
        </button>
      </div>
    </BottomSheet>
  );
}
