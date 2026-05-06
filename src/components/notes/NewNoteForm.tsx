"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { NewNoteAyahSuggestion } from "@/components/notes/NewNoteAyahSuggestion";
import { NOTE_TYPE_LABELS } from "@/lib/constants";
import type { NoteTypeEnum } from "@/lib/database.types";
import { NEW_NOTE_USE_CASES } from "@/lib/note-samples";
import { safeAppPath } from "@/lib/safe-app-path";

const noteTypes: NoteTypeEnum[] = [
  "khutbah",
  "lecture",
  "quran_reflection",
  "halaqa",
  "personal_reminder",
];

const FORM_ID = "new-note-form";

type NewNoteFormProps = {
  initialNoteType?: NoteTypeEnum;
  showOnboardingHint?: boolean;
  /** Optional prefilled context (e.g. from Qur'an reader). Applied when input is empty on load. */
  reflectionSeed?: string;
};

export function NewNoteForm({
  initialNoteType,
  showOnboardingHint = false,
  reflectionSeed,
}: NewNoteFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [noteType, setNoteType] = useState<NoteTypeEnum>(
    initialNoteType ?? "khutbah",
  );
  const [rawInput, setRawInput] = useState("");

  useEffect(() => {
    if (!reflectionSeed?.trim()) return;
    setRawInput((prev) => {
      if (prev.trim().length > 0) return prev;
      return `${reflectionSeed.trim()}\n\n`;
    });
  }, [reflectionSeed]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-note", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteType, rawInput }),
      });
      let data: { noteId?: string; error?: string } = {};
      try {
        data = (await res.json()) as { noteId?: string; error?: string };
      } catch {
        /* non-JSON body */
      }
      if (res.status === 401) {
        setLoading(false);
        const next = encodeURIComponent(safeAppPath(pathname ?? "/app/new"));
        router.push(`/login?next=${next}`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      if (data.noteId) {
        router.push(`/app/notes/${data.noteId}`);
        router.refresh();
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    }
    setLoading(false);
  }

  function applyUseCase(ex: (typeof NEW_NOTE_USE_CASES)[number]) {
    setNoteType(ex.noteType);
    setRawInput(ex.rawInput);
  }

  return (
    <>
      <section
        id="new-reflection"
        className="scroll-mt-28"
        aria-label="Reflection form"
      >
        {showOnboardingHint ? (
          <p className="mb-5 rounded-2xl border border-mint/60 bg-surface px-4 py-3.5 text-center text-sm text-ink/90 leading-relaxed">
            Start simple. Paste whatever you remember — messy notes are fine.
          </p>
        ) : null}
        <form id={FORM_ID} onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="reflection-input"
            className="block text-sm font-medium text-stone-700 text-center"
          >
            What&apos;s on your mind?
          </label>
          <textarea
            id="reflection-input"
            name="reflection"
            required
            rows={8}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste something you heard, read, or felt… Messy thoughts are okay."
            className="w-full min-h-[11rem] resize-y rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-800 outline-none leading-relaxed placeholder:text-stone-400 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="space-y-2">
            <NewNoteAyahSuggestion
              rawInput={rawInput}
              onApplySnippet={(snippet) =>
                setRawInput((prev) => `${prev.trimEnd()}${snippet}`)
              }
            />
            {noteType === "khutbah" || noteType === "lecture" ? (
              <p className="text-xs text-stone-500 text-center leading-relaxed">
                After you save, recording + timestamps sit beside your note — no need to hurry in
                the masjid aisle.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="note-type"
            className="block text-xs text-center text-stone-500"
          >
            Format
          </label>
          <select
            id="note-type"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteTypeEnum)}
            className="w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            {noteTypes.map((t) => (
              <option key={t} value={t}>
                {NOTE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-center text-stone-500">Or start here</p>
          <div className="flex flex-col gap-2">
            {NEW_NOTE_USE_CASES.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => applyUseCase(ex)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-stone-800 shadow-sm transition active:scale-[0.99] hover:border-emerald-200 hover:bg-emerald-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {ex.buttonLabel}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center"
          >
            {error}
          </p>
        ) : null}
        </form>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-stone-50/95 backdrop-blur-md pt-3 shadow-[0_-4px_24px_-2px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto px-4 pt-1 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            type="submit"
            form={FORM_ID}
            disabled={loading || !rawInput.trim()}
            className="w-full rounded-xl bg-emerald-600 text-white font-semibold py-3.5 text-base shadow-md shadow-emerald-900/15 transition hover:bg-emerald-700 disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create reflection"}
          </button>
        </div>
      </div>
    </>
  );
}
