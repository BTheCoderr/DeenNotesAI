"use client";

import { toPng } from "html-to-image";
import { useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { DeenNotesSecondaryMark } from "@/components/brand/DeenNotesSecondaryMark";
import { DeenNotesWordmark } from "@/components/brand/DeenNotesWordmark";
import { SaveShareCardButton } from "@/components/notes/SaveShareCardButton";
import { cn } from "@/lib/utils";

type ShareCardProps = {
  shareCardText: string;
  noteId: string;
  className?: string;
};

/**
 * Shareable reminder card with copy, PNG download (client-side), and save-to-account.
 */
export function ShareCard({ shareCardText, noteId, className }: ShareCardProps) {
  const trimmed = shareCardText.trim();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!trimmed) return null;

  async function handleDownloadPng() {
    setDownloadError(null);
    const el = document.getElementById("deennotes-share-card");
    if (!el) {
      setDownloadError(
        "We couldn't find your card on this page. Try refreshing and try again.",
      );
      return;
    }

    setDownloading(true);
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `deennotes-card-${noteId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setDownloadError(
        "We couldn't create the image. You can still copy the text, or try another browser.",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section
      className={cn("mt-8", className)}
      aria-labelledby="share-card-heading"
    >
      <h2
        id="share-card-heading"
        className="font-display text-lg font-semibold text-ink mb-4"
      >
        Shareable reminder card
      </h2>

      <div
        id="deennotes-share-card"
        className={cn(
          "relative overflow-hidden rounded-2xl border px-5 py-8 md:px-8 md:py-10",
          "border-[#CFE8E0] bg-gradient-to-b from-[#CFE8E0]/50 via-[#F6F4F0] to-[#F6F4F0]",
          "shadow-[0_4px_28px_-8px_rgba(18,122,99,0.14),0_2px_8px_-4px_rgba(28,27,24,0.06)]",
        )}
      >
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#CFE8E0]/40 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#F6F4F0] blur-2xl"
          aria-hidden
        />

        <DeenNotesSecondaryMark
          size="sm"
          className="absolute right-3 top-3 text-[#127A63] opacity-90"
        />

        <div className="relative pr-12">
          <DeenNotesWordmark size="sm" />
          <p className="sr-only">Reflection reminder</p>

          <p className="mt-6 text-base md:text-lg text-ink leading-relaxed font-medium whitespace-pre-wrap text-pretty">
            {trimmed}
          </p>

          <p className="mt-8 pt-6 border-t border-[#CFE8E0] text-[0.7rem] md:text-xs text-muted leading-relaxed">
            Reflection reminder, not a religious ruling.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
        <CopyButton
          text={trimmed}
          idleLabel="Copy text"
          className="w-full sm:w-auto justify-center rounded-xl border-stone-200 bg-white/90 py-3 sm:py-2.5"
        />
        <button
          type="button"
          onClick={() => void handleDownloadPng()}
          disabled={downloading}
          aria-busy={downloading}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-[#127A63]/30 bg-white px-5 py-3 text-sm font-semibold text-[#127A63] shadow-sm transition hover:bg-[#CFE8E0]/40 disabled:opacity-60 sm:py-2.5"
        >
          {downloading ? "Downloading…" : "Download card"}
        </button>
        <SaveShareCardButton
          noteId={noteId}
          shareCardText={trimmed}
          className="w-full sm:w-auto justify-center rounded-xl border-[#127A63]/30 bg-[#127A63] px-5 py-3 text-white shadow-sm hover:bg-[#0f6b56] hover:text-white sm:py-2.5"
        />
      </div>

      {downloadError ? (
        <p
          className="mt-4 text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
          role="alert"
        >
          {downloadError}
        </p>
      ) : null}
    </section>
  );
}
