"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { NOTE_TYPE_LABELS } from "@/lib/constants";
import type { NoteTypeEnum } from "@/lib/database.types";
import { NEW_NOTE_EXAMPLES } from "@/lib/note-samples";

const noteTypes: NoteTypeEnum[] = [
  "khutbah",
  "lecture",
  "quran_reflection",
  "halaqa",
  "personal_reminder",
];

export function NewNoteForm() {
  const router = useRouter();
  const [noteType, setNoteType] = useState<NoteTypeEnum>("khutbah");
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteType, rawInput }),
      });
      const data = (await res.json()) as { noteId?: string; error?: string };
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

  function applyExample(ex: (typeof NEW_NOTE_EXAMPLES)[number]) {
    setNoteType(ex.noteType);
    setRawInput(ex.rawInput);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-black/5 bg-surface p-5 md:p-8 shadow-card"
    >
      <div>
        <p className="text-sm font-medium text-ink mb-2">Try a sample prompt</p>
        <p className="text-xs text-muted mb-3 leading-relaxed">
          Tap one to fill the form—edit freely before generating.
        </p>
        <div className="flex flex-wrap gap-2">
          {NEW_NOTE_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => applyExample(ex)}
              className="rounded-full border border-black/10 bg-background px-3 py-1.5 text-xs font-medium text-ink hover:border-accent/35 hover:text-accent transition-colors text-left"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="note-type"
          className="block text-sm font-medium text-ink mb-2"
        >
          Note type
        </label>
        <select
          id="note-type"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value as NoteTypeEnum)}
          className="w-full rounded-xl border border-black/10 bg-background px-3 py-3 text-ink outline-none focus:ring-2 focus:ring-accent/30"
        >
          {noteTypes.map((t) => (
            <option key={t} value={t}>
              {NOTE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="raw-input"
          className="block text-sm font-medium text-ink mb-2"
        >
          Your notes
        </label>
        <textarea
          id="raw-input"
          required
          rows={14}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste or type what you heard, read, or want to remember—messy notes are fine."
          className="w-full resize-y min-h-[200px] rounded-2xl border border-black/10 bg-background px-3 py-3 text-base text-ink outline-none focus:ring-2 focus:ring-accent/30 leading-relaxed"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !rawInput.trim()}
        className="w-full rounded-full bg-accent text-white font-semibold py-3.5 text-base hover:bg-accent-hover disabled:opacity-50 transition-colors"
      >
        {loading ? "Generating…" : "Generate structured note"}
      </button>
    </form>
  );
}
