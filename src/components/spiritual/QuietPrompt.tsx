"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LS_KEY = "deennotes.today.heart_prompt.v1";

/** Optional local check-in — skip any time without guilt language. */

export function QuietPrompt() {
  const [value, setValue] = useState("");

  useEffect(() => {
    try {
      setValue(localStorage.getItem(LS_KEY) ?? "");
    } catch {
      setValue("");
    }
  }, []);

  function persistDraft() {
    try {
      const t = value.trim().slice(0, 500);
      if (t) localStorage.setItem(LS_KEY, t);
      else localStorage.removeItem(LS_KEY);
    } catch {
      /* quota */
    }
  }

  return (
    <section className="rounded-[1.25rem] border border-black/[0.06] bg-surface px-5 py-5 space-y-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-muted">
        Heart · optional
      </p>
      <p className="font-display text-lg font-semibold text-ink leading-snug">
        How is your heart today?
      </p>
      <p className="text-xs text-muted leading-relaxed">
        A short phrase or skip — stays on this device; no streaks or scores.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={persistDraft}
        rows={3}
        placeholder="A few honest words optional…"
        className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm resize-none placeholder:text-muted/70"
      />
      <Link
        href="/app/new"
        className="inline-flex text-xs font-bold text-accent underline-offset-4 hover:underline"
      >
        New reflection →
      </Link>
    </section>
  );
}
