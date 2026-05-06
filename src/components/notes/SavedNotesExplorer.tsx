"use client";

import Link from "next/link";
import { useState } from "react";

import { BetaFeedbackCta } from "@/components/dashboard/BetaFeedbackCta";
import { DeenNotesAppIcon } from "@/components/brand/DeenNotesAppIcon";
import { DeenNotesSecondaryMark } from "@/components/brand/DeenNotesSecondaryMark";
import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { labelForNoteType } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NoteListRow = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
  short_summary: string | null;
  summary: string | null;
  main_reminder: string | null;
};

type Props = {
  notes: NoteListRow[];
  loadError?: boolean;
};

const RECENT_CAP = 8;

type LibraryTab = "recent" | "all" | "folders";

export function SavedNotesExplorer({ notes, loadError }: Props) {
  const [tab, setTab] = useState<LibraryTab>("recent");
  const { openNewNoteMenu } = useNewNoteMenu();

  if (loadError) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Reflect</h1>
        <p className="mt-6 text-red-700 bg-red-50 rounded-xl px-4 py-3">
          We couldn&apos;t load your reflections. Refresh and try again.
        </p>
      </div>
    );
  }

  const recentNotes = notes.slice(0, RECENT_CAP);
  const listNotes = tab === "recent" ? recentNotes : notes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Reflect</h1>
          <p className="text-muted mt-2 max-w-prose leading-relaxed text-sm">
            Saved reflections and notes — not rulings or fatwas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => openNewNoteMenu()}
            className="inline-flex rounded-full bg-accent text-white text-sm font-semibold px-5 py-2.5 hover:bg-accent-hover transition-colors"
          >
            New
          </button>
          <BetaFeedbackCta className="text-sm font-semibold text-accent hover:underline shrink-0" />
        </div>
      </div>

      <div className="flex gap-2 p-1 rounded-2xl bg-mint/30 border border-black/6">
        <button
          type="button"
          onClick={() => setTab("recent")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            tab === "recent" ? "bg-surface shadow-sm text-ink" : "text-muted hover:text-ink",
          )}
        >
          Recent
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            tab === "all" ? "bg-surface shadow-sm text-ink" : "text-muted hover:text-ink",
          )}
        >
          All notes
        </button>
        <button
          type="button"
          onClick={() => setTab("folders")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            tab === "folders"
              ? "bg-surface shadow-sm text-ink"
              : "text-muted hover:text-ink",
          )}
        >
          Folders
        </button>
      </div>

      {tab === "folders" ? (
        <div className="rounded-3xl border border-dashed border-black/12 bg-surface px-6 py-16 text-center shadow-sm">
          <p className="font-display text-xl font-semibold text-ink">Folders</p>
          <p className="text-muted text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            Organize khutbah, lecture, and halaqa notes into folders — coming soon.
          </p>
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-surface px-6 py-16 text-center shadow-card">
          <div className="relative mx-auto mb-6 flex w-fit flex-col items-center gap-3">
            <DeenNotesAppIcon size="lg" variant="light" />
            <DeenNotesSecondaryMark size="sm" className="opacity-85 text-accent" />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Nothing saved yet
          </h2>
          <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
            When you capture a khutbah, lecture, or reflection, it will appear here with a short summary line.
          </p>
          <button
            type="button"
            onClick={() => openNewNoteMenu()}
            className="inline-flex mt-8 rounded-full bg-accent text-white font-semibold px-7 py-3 hover:bg-accent-hover transition-colors"
          >
            Create your first reflection
          </button>
          <p className="mt-10 text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Prefer a guided start? Try{" "}
            <Link href="/app/onboarding" className="font-semibold text-accent hover:underline">
              onboarding
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">
            {tab === "recent"
              ? `${recentNotes.length} recent`
              : `${notes.length} total`}
          </p>
          <ul className="space-y-3 pb-24">
            {listNotes.map((n) => {
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
                      <p className="font-display font-semibold text-ink line-clamp-2">
                        {n.title}
                      </p>
                      <span className="text-xs font-semibold text-accent whitespace-nowrap shrink-0">
                        {labelForNoteType(n.note_type)}
                      </span>
                    </div>
                    <p className="text-xs text-muted/90 mt-2">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                    {preview ? (
                      <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
                        {preview}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
