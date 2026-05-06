"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { ShareCard } from "@/components/notes/ShareCard";
import { labelForNoteType } from "@/lib/constants";

export type NoteDetailPayload = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
  summary: string;
  short_summary: string;
  main_reminder: string;
  key_reminders: string[];
  action_steps: string[];
  reflection_questions: string[];
  dua_prompts: string[];
  share_card_text: string;
  disclaimer: string;
  raw_input: string;
};

type TabKey = "summary" | "actions" | "dua" | "reflection" | "share";

const TABS: { key: TabKey; label: string }[] = [
  { key: "summary", label: "AI Summary" },
  { key: "actions", label: "Action Steps" },
  { key: "dua", label: "Dua" },
  { key: "reflection", label: "Reflection" },
  { key: "share", label: "Share Card" },
];

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="mt-6">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-ink/90 leading-relaxed">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent font-bold shrink-0">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NoteDetailScreen({ note }: { note: NoteDetailPayload }) {
  const [tab, setTab] = useState<TabKey>("summary");
  const [chatOpen, setChatOpen] = useState(false);

  const shortSummary =
    (typeof note.short_summary === "string" && note.short_summary.trim()) ||
    note.summary?.trim() ||
    "";

  const trimmedShare = note.share_card_text.trim();

  const onShareNote = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const snippet = shortSummary.trim().slice(0, 240);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: note.title,
          text: snippet,
          url,
        });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          [note.title, snippet, url].filter(Boolean).join("\n\n"),
        );
      }
    } catch {
      /* ignore */
    }
  }, [note.title, shortSummary]);

  return (
    <>
      <article className="pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-28">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/app/notes"
            className="text-sm font-semibold text-accent hover:underline min-w-0"
          >
            ← Back
          </Link>
          <button
            type="button"
            onClick={() => void onShareNote()}
            className="shrink-0 rounded-full border border-accent/30 bg-mint/40 px-4 py-2 text-xs font-semibold text-accent hover:bg-mint/70 transition-colors"
          >
            Share
          </button>
        </div>

        <header className="mt-5">
          <span className="inline-flex rounded-full border border-accent/25 bg-mint/40 px-3 py-1 text-xs font-semibold text-accent">
            {labelForNoteType(note.note_type)}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mt-4 leading-tight">
            {note.title}
          </h1>
          <p className="text-xs text-muted mt-3">
            {new Date(note.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </header>

        {note.main_reminder ? (
          <section className="mt-6 rounded-2xl border border-accent/25 bg-accent-soft/50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Main reminder
            </p>
            <p className="mt-3 text-lg font-medium text-ink leading-relaxed">
              {note.main_reminder}
            </p>
          </section>
        ) : null}

        <div
          className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
          role="tablist"
          aria-label="Note sections"
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={
                tab === key
                  ? "shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  : "shrink-0 rounded-full border border-black/10 bg-surface px-4 py-2 text-xs font-semibold text-muted hover:border-accent/25"
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-black/6 bg-surface p-5 shadow-sm min-h-[12rem]">
          {tab === "summary" ? (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Summary
              </h2>
              <p className="mt-3 text-ink/90 leading-relaxed whitespace-pre-wrap text-sm">
                {shortSummary || "—"}
              </p>
              <ListSection title="Key reminders" items={note.key_reminders} />
            </div>
          ) : null}

          {tab === "actions" ? (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Action steps for this week
              </h2>
              {note.action_steps.length ? (
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink/90">
                  {note.action_steps.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">No action steps listed.</p>
              )}
            </div>
          ) : null}

          {tab === "dua" ? (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Dua prompts
              </h2>
              {note.dua_prompts.length ? (
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink/90">
                  {note.dua_prompts.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">No dua prompts listed.</p>
              )}
            </div>
          ) : null}

          {tab === "reflection" ? (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Reflection questions
              </h2>
              {note.reflection_questions.length ? (
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/90">
                  {note.reflection_questions.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">No prompts listed.</p>
              )}
            </div>
          ) : null}

          {tab === "share" ? (
            <div>
              {trimmedShare ? (
                <ShareCard
                  shareCardText={note.share_card_text}
                  noteId={note.id}
                  className="mt-0"
                />
              ) : (
                <p className="text-sm text-muted">
                  No share card text for this note yet.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <section className="mt-6 rounded-2xl border border-black/5 bg-background p-5 text-sm text-muted leading-relaxed">
          <h2 className="font-semibold text-ink text-base mb-2">Disclaimer</h2>
          <p className="whitespace-pre-wrap">{note.disclaimer}</p>
        </section>

        <details className="mt-4 rounded-2xl border border-black/5 bg-surface p-5 text-sm">
          <summary className="cursor-pointer font-semibold text-ink">
            Original notes
          </summary>
          <p className="mt-4 text-muted whitespace-pre-wrap leading-relaxed">
            {note.raw_input}
          </p>
        </details>
      </article>

      <div className="fixed z-[45] inset-x-0 px-4 pointer-events-none bottom-24 md:bottom-12">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="w-full rounded-2xl border border-black/10 bg-surface/95 backdrop-blur shadow-card px-4 py-3.5 text-left text-sm text-muted ring-4 ring-background"
          >
            Ask anything about this note…
          </button>
        </div>
      </div>

      {chatOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col justify-end bg-ink/40 backdrop-blur-sm md:items-center md:justify-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Ask about note"
        >
          <button
            type="button"
            aria-label="Close chat"
            className="absolute inset-0"
            onClick={() => setChatOpen(false)}
          />
          <div className="relative bg-surface rounded-t-3xl md:rounded-3xl shadow-card border border-black/10 max-h-[72dvh] w-full md:max-w-md flex flex-col">
            <div className="px-5 py-4 border-b border-black/8 flex justify-between items-center gap-3">
              <p className="font-display font-semibold text-ink">
                Ask about this note
              </p>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="text-sm font-semibold text-muted hover:text-accent"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted leading-relaxed">
                Note chat is coming soon.
              </p>
              <CopyButton
                text={
                  shortSummary.trim() ||
                  (note.summary ?? "").slice(0, 500).trim() ||
                  note.title
                }
                idleLabel="Copy summary snippet"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
