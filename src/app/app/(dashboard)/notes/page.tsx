import Link from "next/link";

import { BetaFeedbackCta } from "@/components/dashboard/BetaFeedbackCta";
import { DeenNotesAppIcon } from "@/components/brand/DeenNotesAppIcon";
import { DeenNotesSecondaryMark } from "@/components/brand/DeenNotesSecondaryMark";
import { labelForNoteType } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function NotesListPage() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("deen_notes")
    .select(
      "id, title, note_type, created_at, summary, short_summary, main_reminder",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Saved notes
        </h1>
        <p className="mt-6 text-red-700 bg-red-50 rounded-xl px-4 py-3">
          We couldn&apos;t load your notes. Refresh the page or try again
          later.
        </p>
      </div>
    );
  }

  if (!notes?.length) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              Saved notes
            </h1>
            <p className="text-muted mt-2 max-w-prose leading-relaxed">
              Every note you generate stays private to your account—organized for
              reflection, not for rulings.
            </p>
          </div>
          <BetaFeedbackCta className="text-sm font-semibold text-accent hover:underline shrink-0" />
        </div>

        <div className="rounded-3xl border border-black/10 bg-surface px-6 py-16 text-center shadow-card">
          <div className="relative mx-auto mb-6 flex w-fit flex-col items-center gap-3">
            <DeenNotesAppIcon size="lg" variant="light" />
            <DeenNotesSecondaryMark size="sm" className="opacity-85 text-accent" />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Your journal is ready
          </h2>
          <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Once you turn a khutbah page of scribbles or lecture bullets into a
            DeenNote, it will show up here with summaries, reminders, and a card
            you can copy when it helps someone else—without claiming to be a
            scholar.
          </p>
          <Link
            href="/app/new"
            className="inline-flex mt-8 rounded-full bg-accent text-white font-semibold px-7 py-3 hover:bg-accent-hover transition-colors"
          >
            Create Your First DeenNote
          </Link>
          <p className="mt-10 text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Need help or want to share how beta feels?{" "}
            <BetaFeedbackCta className="font-semibold text-accent hover:underline inline" />
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Saved notes
          </h1>
          <p className="text-muted mt-2">{notes.length} total</p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Link
            href="/app/new"
            className="inline-flex self-start rounded-full bg-accent text-white text-sm font-semibold px-5 py-2.5 hover:bg-accent-hover transition-colors"
          >
            New note
          </Link>
          <BetaFeedbackCta className="text-xs font-semibold text-accent hover:underline sm:text-right" />
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {notes.map((n) => {
          const preview =
            (typeof n.short_summary === "string" && n.short_summary.trim()) ||
            (n.summary && n.summary.trim()) ||
            "";
          return (
            <li key={n.id}>
              <Link
                href={`/app/notes/${n.id}`}
                className="block rounded-2xl border border-black/5 bg-surface p-5 shadow-sm hover:border-accent/25 hover:shadow-card transition-all"
              >
                <div className="flex justify-between gap-2 items-start">
                  <p className="font-semibold text-ink line-clamp-2">{n.title}</p>
                  <span className="text-xs font-medium text-accent whitespace-nowrap shrink-0">
                    {labelForNoteType(n.note_type)}
                  </span>
                </div>
                {typeof n.main_reminder === "string" &&
                n.main_reminder.trim() ? (
                  <p className="text-sm font-medium text-ink/85 mt-2 line-clamp-2 leading-relaxed">
                    {n.main_reminder.trim()}
                  </p>
                ) : null}
                {preview ? (
                  <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
                    {preview}
                  </p>
                ) : null}
                <p className="text-xs text-muted/80 mt-4">
                  {new Date(n.created_at).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
