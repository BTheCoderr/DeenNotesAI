import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/CopyButton";
import { SaveShareCardButton } from "@/components/notes/SaveShareCardButton";
import { labelForNoteType } from "@/lib/constants";
import { asStringArray } from "@/lib/note-json";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

function ListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl border border-black/5 bg-surface p-5 md:p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-muted text-sm leading-relaxed">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent font-bold shrink-0">·</span>
            <span className="text-ink/90">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from("deen_notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !note) {
    notFound();
  }

  const keyReminders = asStringArray(note.key_reminders);
  const actionSteps = asStringArray(note.action_steps);
  const reflectionQs = asStringArray(note.reflection_questions);
  const duaPrompts = asStringArray(note.dua_prompts);

  const shortSummary =
    (typeof note.short_summary === "string" && note.short_summary.trim()) ||
    note.summary?.trim() ||
    "";

  const mainReminder =
    typeof note.main_reminder === "string" ? note.main_reminder.trim() : "";

  return (
    <article>
      <Link
        href="/app/notes"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← All notes
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {labelForNoteType(note.note_type)}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mt-2">
          {note.title}
        </h1>
        <p className="text-xs text-muted mt-3">
          {new Date(note.created_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      {mainReminder ? (
        <section className="mt-8 rounded-2xl border border-accent/25 bg-accent-soft/50 p-5 md:p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Main reminder
          </p>
          <p className="mt-3 text-lg font-medium text-ink leading-relaxed">
            {mainReminder}
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-black/5 bg-surface p-5 md:p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">
          Short summary
        </h2>
        <p className="mt-3 text-ink/90 leading-relaxed whitespace-pre-wrap">
          {shortSummary || "—"}
        </p>
      </section>

      <div className="mt-4 grid gap-4">
        <ListCard title="Key reminders" items={keyReminders} />
        <ListCard title="Action steps" items={actionSteps} />
        <ListCard title="Reflection questions" items={reflectionQs} />
        <ListCard title="Dua prompts" items={duaPrompts} />
      </div>

      <section className="mt-8 rounded-2xl border border-accent/20 bg-accent-soft/40 p-5 md:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Shareable reminder
        </h2>
        <p className="mt-4 text-ink/90 leading-relaxed whitespace-pre-wrap font-medium">
          {note.share_card_text}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <CopyButton text={note.share_card_text} />
          <SaveShareCardButton
            noteId={note.id}
            shareCardText={note.share_card_text}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-background p-5 text-sm text-muted leading-relaxed">
        <h2 className="font-semibold text-ink text-base mb-2">Disclaimer</h2>
        <p className="whitespace-pre-wrap">{note.disclaimer}</p>
      </section>

      <details className="mt-6 rounded-2xl border border-black/5 bg-surface p-5 text-sm">
        <summary className="cursor-pointer font-semibold text-ink">
          Original notes
        </summary>
        <p className="mt-4 text-muted whitespace-pre-wrap leading-relaxed">
          {note.raw_input}
        </p>
      </details>
    </article>
  );
}
