"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SurahListSkeletonRows } from "@/features/quran/components/QuranSkeletons";
import { QuranServiceEmptyState } from "@/features/quran/components/QuranServiceEmptyState";
import { useQuranChapters } from "@/features/quran/hooks/useQuranData";
import type { ChapterDto } from "@/lib/quran/types";
import { offlineReflectionSubtitle } from "@/lib/quran/api-contract";
import { QURAN_REFLECTION_FOOTER } from "@/lib/quran/ui-copy";
import { cn } from "@/lib/utils";

function RevelationChip({ revelationPlace }: { revelationPlace: string }) {
  const r = revelationPlace?.toLowerCase() ?? "";
  const isMakkah = r.includes("makkah") || r.includes("makki");
  const isMadinah = r.includes("madinah") || r.includes("madani");
  const label =
    isMakkah ? "Makkī" : isMadinah ? "Madanī" : revelationPlace.slice(0, 10) || "—";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ring-1",
        isMakkah && "bg-mint/55 text-accent ring-accent/25",
        isMadinah && "bg-accent/10 text-accent ring-accent/22",
        !isMakkah && !isMadinah && "bg-black/[0.04] text-muted ring-black/[0.08]",
      )}
    >
      {label}
    </span>
  );
}

export function SurahListScreen() {
  const {
    chapters,
    serviceMeta,
    error,
    errorCode,
    retryable,
    loading,
    reload,
  } = useQuranChapters();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!chapters) return [];
    const s = q.trim().toLowerCase();
    if (!s) return chapters;
    return chapters.filter(
      (c: ChapterDto) =>
        String(c.id).includes(s) ||
        c.nameSimple.toLowerCase().includes(s) ||
        c.nameArabic.includes(q.trim()) ||
        (c.transliteratedName?.toLowerCase().includes(s) ?? false) ||
        (c.translatedName?.toLowerCase().includes(s) ?? false),
    );
  }, [chapters, q]);

  const offlineHelp = useMemo(
    () => offlineReflectionSubtitle(serviceMeta ?? null),
    [serviceMeta],
  );

  return (
    <div className="space-y-6 pb-28">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-gradient-to-br from-mint/50 via-accent-soft/35 to-background px-[1.15rem] py-8 shadow-card">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(18,122,99,0.18),transparent_55%)] motion-reduce:opacity-70"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-14 bottom-[-40%] h-48 w-48 rounded-full bg-accent/8 blur-3xl motion-reduce:hidden"
          aria-hidden
        />
        <div className="relative">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
            Al-Qurʼān al-Karīm
          </p>
          <h1 className="font-display text-[1.75rem] sm:text-[2rem] font-semibold text-ink mt-3 leading-[1.15] tracking-tight">
            A calm reader
          </h1>
          <p className="text-sm text-muted mt-3 max-w-prose leading-relaxed">
            Immerse in Arabic typography, layered translation, tafsir, and audio—all
            structured to mirror future mobile parity.
          </p>
          <label className="sr-only" htmlFor="surah-quran-search">
            Search surahs
          </label>
          <input
            id="surah-quran-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find by surah number or English name…"
            className="mt-6 w-full rounded-2xl border border-black/[0.1] bg-surface/95 px-4 py-3.5 text-[0.9375rem] text-ink shadow-inner outline-none transition-shadow focus:border-accent/35 focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </header>

      {offlineHelp ? (
        <p className="rounded-2xl border border-accent/20 bg-accent-soft/30 px-4 py-3 text-xs text-ink leading-relaxed">
          {offlineHelp}
        </p>
      ) : null}

      {loading ? (
        <SurahListSkeletonRows count={8} />
      ) : error ? (
        <QuranServiceEmptyState
          description={error}
          serviceMeta={serviceMeta}
          errorCode={errorCode}
          retryable={retryable}
          onReconnect={retryable ? () => void reload() : undefined}
        />
      ) : (
        <ul className="space-y-3.5 motion-safe:[&>*]:motion-safe-[animation-delay:calc(var(--i)*40ms)]">
          {filtered.map((c: ChapterDto, i: number) => (
            <li
              key={c.id}
              style={{ "--i": i } as React.CSSProperties}
              className="motion-safe:animate-quran-soft-in motion-reduce:animate-none"
            >
              <Link
                href={`/app/quran/${c.id}`}
                className={cn(
                  "group flex flex-col rounded-[1.35rem] border border-black/[0.06] bg-surface px-4 py-4 shadow-sm",
                  "transition-all duration-300 hover:border-accent/28 hover:shadow-[0_14px_40px_rgba(28,27,24,0.07)] motion-safe:hover:-translate-y-[3px]",
                )}
              >
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-mint/60 to-accent-soft/50 shadow-inner">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-accent/75">
                      Surah
                    </span>
                    <span className="font-display text-lg font-semibold tabular-nums text-accent leading-none mt-1">
                      {c.id}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-[1.05rem] font-semibold text-ink truncate group-hover:text-accent transition-colors">
                          {c.nameSimple}
                        </p>
                        <p
                          className="text-xl text-ink/90 leading-snug mt-1 truncate"
                          dir="rtl"
                          lang="ar"
                          translate="no"
                        >
                          {c.nameArabic}
                        </p>
                      </div>
                      <RevelationChip revelationPlace={c.revelationPlace} />
                    </div>
                    <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-wide text-muted">
                      {c.versesCount} ayāt
                      {c.translatedName ? ` · ${c.translatedName}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <nav
        className="flex gap-6 px-1 text-xs font-semibold text-accent uppercase tracking-wide"
        aria-label="Coming soon"
      >
        <Link href="/app/quran/search" className="hover:underline opacity-85">
          Search
        </Link>
        <Link href="/app/quran/bookmarks" className="hover:underline opacity-85">
          Bookmarks
        </Link>
      </nav>

      <p className="text-[0.68rem] text-muted leading-relaxed px-1 pb-6 border-t border-black/[0.04] pt-6">
        {QURAN_REFLECTION_FOOTER}
      </p>
    </div>
  );
}
