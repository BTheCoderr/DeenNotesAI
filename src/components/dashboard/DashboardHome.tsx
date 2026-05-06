"use client";

import Link from "next/link";

import { BetaFeedbackCta } from "@/components/dashboard/BetaFeedbackCta";
import { WeeklyDateStrip } from "@/components/app/WeeklyDateStrip";
import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { APP_DISCLAIMER, labelForNoteType } from "@/lib/constants";

export type DashboardLatestNote = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
  short_summary: string | null;
  summary: string | null;
} | null;

type Props = {
  latest: DashboardLatestNote;
};

export function DashboardHome({ latest }: Props) {
  const { openNewNoteMenu } = useNewNoteMenu();

  const preview =
    latest &&
    ((typeof latest.short_summary === "string" && latest.short_summary.trim()) ||
      (latest.summary && latest.summary.trim()) ||
      "");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Today&apos;s Reflection
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mt-2 leading-tight">
          Assalamu alaikum
        </h1>
        <p className="text-muted mt-3 text-sm leading-relaxed max-w-prose">
          Capture what you heard. Organize reminders, duas, and next steps—reflection
          only, not rulings.
        </p>
      </header>

      <WeeklyDateStrip />

      <section className="space-y-4">
        <button
          type="button"
          onClick={() => openNewNoteMenu()}
          className="w-full text-left rounded-2xl border border-accent/20 bg-gradient-to-br from-mint/50 to-surface p-5 shadow-card transition hover:border-accent/35 active:scale-[0.99]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Start here
          </p>
          <p className="font-display text-lg font-semibold text-ink mt-2">
            Start your first reflection
          </p>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Turn khutbah pages, lectures, or personal notes into a calm summary you
            can revisit.
          </p>
        </button>

        <div className="rounded-2xl border border-black/[0.06] bg-surface p-5 shadow-sm">
          <p className="font-display font-semibold text-ink">
            Note-inspired reminders
          </p>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Build a rhythm: capture after Jumu’ah or study, skim your weekly strip,
            and pick one reminder to carry into everyday life—always beside advice
            from qualified teachers.
          </p>
        </div>
      </section>

      {latest ? (
        <section className="rounded-2xl border border-black/6 bg-background p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Latest note
          </p>
          <Link
            href={`/app/notes/${latest.id}`}
            className="mt-3 block rounded-xl bg-surface border border-black/6 p-4 hover:border-accent/25 transition-colors"
          >
            <div className="flex justify-between gap-2 items-start">
              <p className="font-display font-semibold text-ink line-clamp-2">
                {latest.title}
              </p>
              <span className="text-xs font-semibold text-accent shrink-0">
                {labelForNoteType(latest.note_type)}
              </span>
            </div>
            {preview ? (
              <p className="text-sm text-muted mt-2 line-clamp-3 leading-relaxed">
                {preview}
              </p>
            ) : null}
            <p className="text-xs text-muted/80 mt-3">
              {new Date(latest.created_at).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </p>
          </Link>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => openNewNoteMenu()}
        className="w-full rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-card hover:bg-accent-hover transition-colors"
      >
        Create DeenNote
      </button>

      <p className="text-[0.65rem] text-muted leading-relaxed max-w-prose pb-6">
        {APP_DISCLAIMER}
      </p>

      <p className="text-sm">
        <BetaFeedbackCta />
      </p>
    </div>
  );
}
