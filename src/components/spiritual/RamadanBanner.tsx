"use client";

import Link from "next/link";

type Props = {
  ramadanDay?: number | null;
};

export function RamadanBanner({ ramadanDay }: Props) {
  return (
    <section className="rounded-2xl border border-emerald-900/15 bg-emerald-950/[0.06] px-4 py-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/65">
        Ramadan
      </p>
      <p className="font-display text-lg font-semibold text-emerald-950 mt-1 leading-snug">
        Gentle days of fasting {ramadanDay != null ? `(day ${ramadanDay})` : ""}
      </p>
      <p className="text-xs text-muted mt-2 leading-relaxed">
        No rush — open Ramadan rhythms when you have space.
      </p>
      <Link
        href="/app/prayer/ramadan"
        className="inline-flex mt-3 text-xs font-bold text-accent underline-offset-4 hover:underline"
      >
        Ramadan companionship →
      </Link>
    </section>
  );
}
