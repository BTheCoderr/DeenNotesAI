"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function QuranSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.warn(
      JSON.stringify({
        tag: "deennotes.quran.ui",
        scope: "error-boundary",
        message: String(error?.message ?? "unknown").slice(0, 280),
        digest: error?.digest,
      }),
    );
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 space-y-6">
      <div className="rounded-[1.5rem] border border-black/[0.08] bg-surface px-6 py-8 shadow-card space-y-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
          Reader safeguard
        </p>
        <h1 className="font-display text-xl font-semibold text-ink leading-tight">
          This screen closed gently to protect your session.
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Nothing you typed was lost elsewhere in the app. Try returning to the surah
          list — if the issue repeats, check your connection or try again after a
          short pause.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-accent px-5 py-2 text-xs font-bold text-white hover:bg-accent-hover"
          >
            Try again
          </button>
          <Link
            href="/app/quran"
            className="rounded-full border border-black/[0.1] bg-background px-5 py-2 text-xs font-bold text-accent"
          >
            Surah index
          </Link>
        </div>
      </div>
    </div>
  );
}
