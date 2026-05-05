import Link from "next/link";

import { BetaFeedbackCta } from "@/components/dashboard/BetaFeedbackCta";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("deen_notes")
    .select("*", { count: "exact", head: true });

  const total = count ?? 0;

  if (total === 0) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            Assalamu alaikum
          </h1>
          <p className="text-muted mt-3 text-lg leading-relaxed max-w-prose">
            Welcome to your learning journal. Capture khutbahs, lectures, and
            reflections here—organized for your heart, not for legal verdicts.
          </p>
          <p className="mt-4">
            <BetaFeedbackCta />
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-black/12 bg-gradient-to-b from-surface to-background px-6 py-14 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Your first step
          </p>
          <h2 className="font-display text-2xl font-semibold text-ink mt-3">
            Nothing here yet—and that&apos;s okay
          </h2>
          <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
            When you&apos;re ready, paste rough notes from the masjid, a class,
            or your own reflection. DeenNotes will help shape them into a calm
            summary, reminders, and next steps you can revisit.
          </p>
          <Link
            href="/app/new"
            className="inline-flex mt-8 rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-card hover:bg-accent-hover transition-colors"
          >
            Create your first DeenNote
          </Link>
          <p className="text-xs text-muted mt-8 max-w-sm mx-auto leading-relaxed">
            DeenNotes does not give fatwas or rulings. For religious decisions,
            ask a qualified scholar or your imam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            Assalamu alaikum
          </h1>
          <p className="text-muted mt-3 text-lg leading-relaxed">
            Your space for khutbah notes, reflections, and gentle next steps—not
            for fatwas or rulings.
          </p>
        </div>
        <BetaFeedbackCta className="shrink-0 text-sm font-semibold text-accent hover:underline self-start" />
      </div>

      <div className="mt-8 grid gap-4">
        <Link
          href="/app/new"
          className="block rounded-2xl border border-black/5 bg-surface p-6 shadow-card hover:border-accent/25 transition-colors"
        >
          <p className="text-sm font-semibold text-accent uppercase tracking-wide">
            Start here
          </p>
          <p className="font-display text-xl font-semibold text-ink mt-2">
            Create a new DeenNote
          </p>
          <p className="text-muted text-sm mt-2 leading-relaxed">
            Paste rough notes and let DeenNotes help you structure them.
          </p>
        </Link>

        <div className="rounded-2xl border border-black/5 bg-background p-6">
          <p className="text-sm text-muted">Saved notes</p>
          <p className="font-display text-3xl font-semibold text-ink mt-1">
            {total}
          </p>
          <Link
            href="/app/notes"
            className="inline-block mt-4 text-sm font-semibold text-accent hover:underline"
          >
            View all notes
          </Link>
        </div>
      </div>
    </div>
  );
}
