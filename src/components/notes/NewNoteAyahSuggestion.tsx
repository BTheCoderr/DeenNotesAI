"use client";

import { useMemo, useState } from "react";

type Props = {
  rawInput: string;
  onApplySnippet: (snippet: string) => void;
};

/**
 * Detects “2:255” style references at word boundaries; offers in-editor insert without navigation.
 */
export function NewNoteAyahSuggestion({ rawInput, onApplySnippet }: Props) {
  const [busy, setBusy] = useState(false);
  const match = useMemo(() => {
    const re = /\b(\d{1,3})\s*[:：]\s*(\d{1,3})\b/g;
    let m: RegExpExecArray | null = null;
    let last: RegExpExecArray | null = null;
    while ((m = re.exec(rawInput))) last = m;
    if (!last) return null;
    const s = Number(last[1]);
    const a = Number(last[2]);
    if (!Number.isInteger(s) || s < 1 || s > 114) return null;
    if (!Number.isInteger(a) || a < 1 || a > 286) return null;
    return { s, a, raw: last[0] };
  }, [rawInput]);

  if (!match) return null;

  async function insertRich() {
    const ref = match;
    if (!ref) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/quran/verses/${ref.s}/${ref.a}`, {
        cache: "no-store",
      });
      const j = (await res.json()) as {
        verse?: { textUthmani?: string; textImlaei?: string };
      };
      const arabic = j.verse?.textUthmani || j.verse?.textImlaei || "";
      const line = arabic
        ? `\n\n« ${arabic} »\n— Quran ${ref.s}:${ref.a}\n`
        : `\n\n[Quran ${ref.s}:${ref.a}]\n`;
      onApplySnippet(line);
    } catch {
      onApplySnippet(`\n\n[Quran ${ref.s}:${ref.a}]\n`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-accent/20 bg-accent-soft/35 px-3 py-2.5 shadow-inner"
    >
      <div className="text-xs text-ink leading-snug min-w-[8rem]">
        <span className="font-bold text-accent">{match.raw}</span>
        <span className="text-muted"> · insert as Quran card block</span>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void insertRich()}
        className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-45"
      >
        {busy ? "Fetching…" : "Insert ayah"}
      </button>
    </div>
  );
}
