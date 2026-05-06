"use client";

import Link from "next/link";

type Props = {
  message: string | null;
};

/** In-app salah line tied to `/api/prayer/today`; not browser push. */

export function QuietReminderBanner({ message }: Props) {
  if (!message) return null;

  return (
    <aside
      className="rounded-2xl border border-emerald-950/14 bg-gradient-to-br from-[#FBF9F5] via-[#EEF6F1] to-[#E6EEE9] px-4 py-3 shadow-sm"
      aria-live="polite"
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-950/55">
        Quiet reminder
      </p>
      <p className="font-display text-[1.05rem] font-medium text-emerald-950 leading-snug mt-1">
        {message}
      </p>
      <p className="text-[0.7rem] text-muted mt-2 leading-relaxed">
        Remind me before prayer — adjust in{" "}
        <Link
          href="/app/prayer/settings"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Prayer settings
        </Link>
      </p>
    </aside>
  );
}
