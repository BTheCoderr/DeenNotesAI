"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  getRecentQuranQueries,
  recordQuranBrowseQuery,
} from "@/lib/browser/quran-memory";
import { cn } from "@/lib/utils";

/**
 * Lightweight surah jumper + query memory until Quran Foundation Search is activated in production.
 */
export function QuranBrowseSearchPanel({
  variant = "page",
}: {
  variant?: "page" | "compact";
}) {
  const router = useRouter();
  const [surahDraft, setSurahDraft] = useState("");
  const [queries, setQueries] = useState<string[]>(() => getRecentQuranQueries());

  const recentSurahsHint = useMemo(() => queries, [queries]);

  function submit(raw: string) {
    const n = Number(String(raw).replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n < 1 || n > 114) return;
    const label = String(n);
    recordQuranBrowseQuery(`surah ${label}`);
    setQueries(getRecentQuranQueries());
    router.push(`/app/quran/${label}`);
  }

  return (
    <div
      className={cn(
        "space-y-4",
        variant === "page" && "rounded-3xl border border-black/[0.06] bg-gradient-to-br from-mint/35 via-surface to-background p-6 shadow-card",
      )}
    >
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Surah navigator</h2>
        <p className="text-sm text-muted mt-2 leading-relaxed max-w-prose">
          Jump by number (1–114). We remember your attempts quietly on this device — no server search
          yet.
        </p>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(surahDraft);
        }}
      >
        <label className="sr-only" htmlFor="surah-jump-input">
          Surah number
        </label>
        <input
          id="surah-jump-input"
          inputMode="numeric"
          maxLength={3}
          value={surahDraft}
          onChange={(e) => setSurahDraft(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="e.g. 67"
          className="min-w-[7rem] flex-1 rounded-2xl border border-black/[0.1] bg-surface px-4 py-3 text-ink shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <button
          type="submit"
          className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-elev-1 hover:bg-accent-hover transition-colors"
        >
          Open
        </button>
      </form>

      {recentSurahsHint.length ? (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
            Recent jumps
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSurahsHint.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  const m = /^surah\s+(\d+)/i.exec(q);
                  if (m) submit(m[1]!);
                }}
                className="rounded-full border border-black/[0.08] bg-surface/90 px-3 py-1 text-xs font-semibold text-muted hover:border-accent/30 hover:text-accent transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-xs text-muted leading-relaxed">
        Full-text Qur&apos;an search needs additional production approval from Quran Foundation — per
        their credential email. For now:{" "}
        <Link href="/app/quran" className="font-semibold text-accent hover:underline">
          browse the surah index
        </Link>
        .
      </p>
    </div>
  );
}
