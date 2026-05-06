"use client";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { AnimatedList, PremiumCard, SectionHeading, animatedListItemVariants } from "@/components/ds";
import { useQuranChapters } from "@/features/quran/hooks/useQuranData";
import type {
  QuranBookmarkKind,
  QuranBookmarkStored,
} from "@/lib/browser/quran-memory";
import { listQuranBookmarks, removeQuranBookmark } from "@/lib/browser/quran-memory";
import { cn } from "@/lib/utils";
import type { ChapterDto } from "@/lib/quran/types";

const KIND_LABELS: Record<QuranBookmarkKind, string> = {
  marker: "Ribbon",
  favorite: "Favorite",
  reflection: "Reflection",
  tafsir: "Tafsir pin",
};

export function QuranBookmarksScreen() {
  const reduceMotion = useReducedMotion();
  const { chapters } = useQuranChapters();
  const [, setRev] = useState(0);

  const bySurahName = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of chapters ?? []) {
      const ch = c as ChapterDto;
      m.set(Number(ch.id), ch.nameSimple);
    }
    return m;
  }, [chapters]);

  const list = listQuranBookmarks();

  const grouped = useMemo(() => {
    const g = new Map<number, QuranBookmarkStored[]>();
    for (const b of list) {
      const cur = g.get(b.surah) ?? [];
      cur.push(b);
      g.set(b.surah, cur);
    }
    return [...g.entries()].sort((a, b) => a[0] - b[0]);
  }, [list]);

  const recent = list.slice(0, 8);

  const bump = useCallback(() => setRev((t) => t + 1), []);

  return (
    <div className="space-y-8 pb-[max(6rem,calc(env(safe-area-inset-bottom)+6rem))] md:pb-14">
      <div className="flex items-start justify-between gap-4">
        <Link
          href="/app/quran"
          className="text-sm font-semibold text-accent hover:underline shrink-0 pt-1"
        >
          ← Surahs
        </Link>
        <div className="text-right space-y-1 max-w-[14rem]">
          <p className="font-display text-2xl font-semibold text-ink">Bookmarks</p>
          <p className="text-xs text-muted leading-relaxed">
            Private on this browser — serenity first, sync can arrive later beside your scholar notes.
          </p>
        </div>
      </div>

      {recent.length > 0 ? (
        <PremiumCard elevated="sm" className="border-accent/14 p-5">
          <SectionHeading
            eyebrow="Recent saves"
            title="What your heart stalled on"
            description="Most recent ribbon first — tenderness over filing systems."
            className="space-y-1.5 [&_h2]:text-base"
          />
          <AnimatedList stagger className="mt-4 space-y-2.5">
            {recent.map((b) => (
              <motion.li
                key={b.id}
                variants={animatedListItemVariants(!!reduceMotion)}
                className="flex items-start justify-between gap-3 rounded-2xl border border-black/[0.06] bg-surface/90 px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-accent">
                    {KIND_LABELS[b.kind]}
                  </p>
                  <Link
                    href={`/app/quran/${b.surah}/${b.ayah}`}
                    className="font-display text-sm font-semibold text-ink hover:text-accent"
                  >
                    Surah {b.surah} · Ayah {b.ayah}
                  </Link>
                  {b.reflection ? (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{b.reflection}</p>
                  ) : null}
                  {b.tags?.length ? (
                    <p className="text-[0.65rem] text-accent font-semibold mt-1">
                      {b.tags.join(" · ")}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeQuranBookmark(b.id);
                    bump();
                  }}
                  className="shrink-0 text-[0.65rem] font-semibold text-muted hover:text-red-700"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </AnimatedList>
        </PremiumCard>
      ) : null}

      <section className="space-y-4">
        <SectionHeading
          eyebrow="By surah"
          title="Grouped like soft stacks"
          description="Each pile stays beside its surah anchor — familiarity helps return visits."
        />
        {grouped.length === 0 ? (
          <PremiumCard elevated="sm" className="border-dashed border-accent/25 p-8 text-center">
            <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">
              Save ayat from the reader with ribbon, favorites, reflections, or tafsir pins — they seed
              this shelf automatically.
            </p>
            <Link
              href="/app/quran"
              className="inline-flex mt-5 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-accent-hover transition-colors"
            >
              Browse surahs
            </Link>
          </PremiumCard>
        ) : (
          <div className="space-y-6">
            {grouped.map(([surahNum, rows]) => {
              const title = bySurahName.get(surahNum) ?? `Surah ${surahNum}`;
              return (
                <PremiumCard key={surahNum} elevated="sm" className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="font-display font-semibold text-ink">{title}</p>
                    <Link
                      href={`/app/quran/${surahNum}`}
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      Open reader →
                    </Link>
                  </div>
                  <ul className="space-y-2.5">
                    {rows.map((b) => (
                      <li
                        key={b.id}
                        className={cn(
                          "flex items-start justify-between gap-3 rounded-xl border border-black/[0.05] bg-background/80 px-3 py-2.5",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">
                            {KIND_LABELS[b.kind]} · Ayah {b.ayah}
                          </p>
                          {b.reflection ? (
                            <p className="text-xs text-ink/88 mt-1 line-clamp-3">{b.reflection}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Link
                            href={`/app/quran/${b.surah}/${b.ayah}`}
                            className="text-[0.65rem] font-semibold text-accent hover:underline"
                          >
                            Focus
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              removeQuranBookmark(b.id);
                              bump();
                            }}
                            className="text-[0.65rem] font-semibold text-muted hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
