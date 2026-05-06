"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AyahReadingCard } from "@/features/quran/components/AyahReadingCard";
import { AyahBookmarkReflectSheet } from "@/features/quran/components/AyahBookmarkReflectSheet";
import { QuranAyahSheet } from "@/features/quran/components/QuranAyahSheet";
import { AyahReaderSkeletonBlocks } from "@/features/quran/components/QuranSkeletons";
import type { QuranAudioTarget } from "@/features/quran/components/QuranStickyPlayer";
import { QuranStickyPlayer } from "@/features/quran/components/QuranStickyPlayer";
import { TranslationPickerSheet } from "@/features/quran/components/TranslationPickerSheet";
import {
  useQuranChapterMeta,
  useQuranVerses,
  useTranslationCatalog,
} from "@/features/quran/hooks/useQuranData";
import {
  appendAyahHistory,
  addOrUpdateBookmark,
  getContinueReading,
  getListeningResume,
  listQuranBookmarks,
  recordRecentSurahVisit,
  setContinueReading,
  syncListeningResume,
  toggleFavoriteAyah,
  toggleMarkerAyah,
} from "@/lib/browser/quran-memory";
import type { VerseDto } from "@/lib/quran/types";
import { readPreferredTranslationIds } from "@/lib/quran/translation-preference";
import { cn } from "@/lib/utils";
import {
  QURAN_REFLECTION_FOOTER,
  QURAN_TAFSIR_PREVIEW_HINT,
} from "@/lib/quran/ui-copy";

type Props = {
  surahNumber: number;
  highlightAyah?: number;
};

export function SurahReaderScreen({ surahNumber, highlightAyah }: Props) {
  const { chapter } = useQuranChapterMeta(surahNumber);
  const translations = useTranslationCatalog();
  const [translationSheetOpen, setTranslationSheetOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("pref");
  const [tafsirAyah, setTafsirAyah] = useState<{ s: number; a: number } | null>(
    null,
  );
  const tafsirTargetRef = useRef<{ s: number; a: number } | null>(null);

  useEffect(() => {
    if (tafsirAyah) tafsirTargetRef.current = tafsirAyah;
  }, [tafsirAyah]);

  const tafsirTarget = tafsirAyah ?? tafsirTargetRef.current;
  const tafsirSheetEverOpened = tafsirTargetRef.current !== null;
  const [readingMode, setReadingMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [bookmarkGen, setBookmarkGen] = useState(0);
  const [reflectAyah, setReflectAyah] = useState<number | null>(null);
  const [mushafMemory, setMushafMemory] = useState(() => ({
    cont: null as ReturnType<typeof getContinueReading>,
    listen: null as ReturnType<typeof getListeningResume>,
  }));

  const scrollWriteRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAyahWritten = useRef<number | null>(null);

  const refreshMushafMemory = useCallback(() => {
    setMushafMemory({
      cont: getContinueReading(),
      listen: getListeningResume(),
    });
  }, []);

  const queryPart = useMemo(() => {
    const stored = readPreferredTranslationIds();
    if (stored) return `?translations=${encodeURIComponent(stored)}`;
    const n = Number(selectedTranslation);
    if (selectedTranslation !== "pref" && Number.isFinite(n)) {
      return `?translations=${n}`;
    }
    return "";
  }, [selectedTranslation]);

  const { verses, error, loading } = useQuranVerses(surahNumber, queryPart);

  const bookmarkKeys = useMemo(() => {
    void bookmarkGen;
    const s = new Set<string>();
    for (const b of listQuranBookmarks()) {
      s.add(`${b.surah}:${b.ayah}:${b.kind}`);
    }
    return s;
  }, [bookmarkGen]);

  useEffect(() => {
    refreshMushafMemory();
  }, [refreshMushafMemory]);

  useEffect(() => {
    recordRecentSurahVisit(surahNumber);
    if (highlightAyah) {
      setContinueReading(surahNumber, highlightAyah);
      appendAyahHistory(surahNumber, highlightAyah);
      refreshMushafMemory();
    }
  }, [surahNumber, highlightAyah, refreshMushafMemory]);

  useEffect(() => {
    if (!verses?.length) return undefined;

    function computeAyahNearTop(): number {
      const versesList = verses;
      if (!versesList?.length) return 1;
      const offset =
        typeof window !== "undefined"
          ? window.scrollY + Math.min(160, window.innerHeight * 0.18)
          : 0;
      let best = versesList[0]!.verseNumber;
      for (const v of versesList) {
        const el = document.getElementById(`ayah-${v.verseNumber}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= offset) best = v.verseNumber;
      }
      return best;
    }

    function flush() {
      const ayah = computeAyahNearTop();
      setContinueReading(surahNumber, ayah);
      if (lastAyahWritten.current !== ayah) {
        lastAyahWritten.current = ayah;
        appendAyahHistory(surahNumber, ayah);
      }
      refreshMushafMemory();
    }

    const warmup = () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(flush));
    };
    warmup();

    const onScroll = () => {
      if (scrollWriteRef.current) clearTimeout(scrollWriteRef.current);
      scrollWriteRef.current = setTimeout(flush, 420);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollWriteRef.current) clearTimeout(scrollWriteRef.current);
    };
  }, [verses, surahNumber, refreshMushafMemory]);

  const [audioTarget, setAudioTarget] = useState<QuranAudioTarget | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioTarget) {
      setAudioUrl(null);
      setAudioError(null);
      return;
    }
    let cancel = false;
    setAudioLoading(true);
    setAudioError(null);
    void (async () => {
      try {
        const res = await fetch(
          `/api/quran/audio?surah=${audioTarget.surah}&ayah=${audioTarget.ayah}`,
        );
        const j = (await res.json()) as { audioUrl?: string; error?: string };
        if (cancel) return;
        if (!res.ok || !j.audioUrl) {
          setAudioError(j.error ?? "Could not load audio.");
          setAudioUrl(null);
          return;
        }
        setAudioUrl(j.audioUrl);
      } catch {
        if (!cancel) {
          setAudioError("Audio request failed.");
          setAudioUrl(null);
        }
      } finally {
        if (!cancel) setAudioLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [audioTarget]);

  useEffect(() => {
    if (!audioTarget) return;
    syncListeningResume(audioTarget.surah, audioTarget.ayah);
    refreshMushafMemory();
  }, [audioTarget, refreshMushafMemory]);

  const onListen = useCallback(
    (surah: number, ayah: number, verse: VerseDto) => {
      const label = chapter?.nameSimple?.trim();
      setAudioTarget({
        surah,
        ayah,
        verse,
        chapterLabel: label ? `${label} · Ayah ${ayah}` : undefined,
      });
    },
    [chapter?.nameSimple],
  );

  useEffect(() => {
    if (!highlightAyah || !verses?.length) return;
    const el = document.getElementById(`ayah-${highlightAyah}`);
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      block: "start",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [highlightAyah, verses]);

  const scrollKey = `deennotes:quranScroll:${surahNumber}`;

  useEffect(() => {
    if (!verses?.length || highlightAyah) return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(scrollKey);
    } catch {
      return;
    }
    if (!raw) return;
    const y = Number(raw);
    if (!Number.isFinite(y) || y < 32) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [verses, highlightAyah, scrollKey]);

  useEffect(() => {
    if (!verses?.length) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        try {
          sessionStorage.setItem(scrollKey, String(window.scrollY));
        } catch {
          /* storage full / private */
        }
      }, 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (t) clearTimeout(t);
    };
  }, [verses, scrollKey]);

  const surahTitle = chapter?.nameSimple ?? `Surah ${surahNumber}`;

  const floatBottom = audioTarget
    ? "bottom-[calc(11.25rem+env(safe-area-inset-bottom))]"
    : "bottom-[calc(6.85rem+env(safe-area-inset-bottom))]";

  return (
    <div
      className={cn(
        "space-y-4",
        audioTarget ? "pb-[10.5rem] md:pb-40" : "pb-28 md:pb-10",
      )}
    >
      <div className="sticky top-0 z-30 -mx-1 border-b border-black/[0.06] bg-background/88 px-1 py-3 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/app/quran"
            className="text-sm font-semibold text-accent hover:underline shrink-0"
          >
            ← Surahs
          </Link>
          <div className="min-w-0 flex-1 text-center px-1">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent">
              Quran
            </p>
            <p className="font-display text-base sm:text-lg font-semibold text-ink truncate">
              {surahTitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setFocusMode((r) => !r)}
              className="rounded-full border border-black/12 bg-background/95 px-2.5 py-2 text-[0.62rem] font-bold uppercase tracking-wide text-accent shadow-sm hover:border-accent/30 transition-colors"
            >
              {focusMode ? "Comfort" : "Focus"}
            </button>
            <button
              type="button"
              onClick={() => setReadingMode((r) => !r)}
              className="rounded-full border border-black/12 bg-background/95 px-2.5 py-2 text-[0.65rem] font-bold uppercase tracking-wide text-accent shadow-sm hover:border-accent/30 transition-colors"
            >
              {readingMode ? "Standard" : "Immerse"}
            </button>
            <button
              type="button"
              onClick={() => setTranslationSheetOpen(true)}
              className="rounded-full border border-accent/30 bg-mint/35 px-3 py-2 text-xs font-semibold text-accent shadow-sm hover:bg-mint/55 transition-colors"
            >
              Translation
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {mushafMemory.cont?.surah && mushafMemory.cont.surah !== surahNumber ? (
          <Link
            href={
              mushafMemory.cont.ayah
                ? `/app/quran/${mushafMemory.cont.surah}/${mushafMemory.cont.ayah}`
                : `/app/quran/${mushafMemory.cont.surah}`
            }
            className="flex flex-wrap items-center justify-between gap-2 rounded-[1.25rem] border border-accent/22 bg-accent-soft/35 px-4 py-3 text-sm shadow-elev-1 backdrop-blur-sm"
          >
            <span className="text-ink leading-snug min-w-[10rem]">
              Continue Mushaf journey ·{" "}
              <strong className="font-semibold text-accent tabular-nums">
                Surah {mushafMemory.cont.surah}
                {mushafMemory.cont.ayah ? ` · ${mushafMemory.cont.ayah}` : ""}
              </strong>
            </span>
            <span className="text-xs font-bold text-accent whitespace-nowrap">Resume →</span>
          </Link>
        ) : null}

        {mushafMemory.cont?.surah === surahNumber &&
        mushafMemory.cont.ayah &&
        mushafMemory.cont.ayah !== highlightAyah ? (
          <Link
            href={`/app/quran/${surahNumber}/${mushafMemory.cont.ayah}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[1.25rem] border border-black/[0.08] bg-mint/30 px-4 py-3 text-sm"
          >
            <span className="text-muted">
              Gentle anchor at{" "}
              <strong className="text-ink">ayah {mushafMemory.cont.ayah}</strong> — follow the thread
              you left.
            </span>
            <span className="text-xs font-bold text-accent whitespace-nowrap">Go →</span>
          </Link>
        ) : null}

        {mushafMemory.listen?.surah ? (
          <Link
            href={`/app/quran/${mushafMemory.listen.surah}/${mushafMemory.listen.ayah}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[1.25rem] border border-black/[0.07] bg-surface px-4 py-3 shadow-elev-1 text-sm"
          >
            <span className="text-muted">
              Last recitation rested at{" "}
              <strong className="tabular-nums text-accent">
                {mushafMemory.listen.surah}:{mushafMemory.listen.ayah}
              </strong>
              .
            </span>
            <span className="text-xs font-bold text-accent whitespace-nowrap">Listen again →</span>
          </Link>
        ) : null}
      </div>

      {!readingMode && !focusMode ? (
        <div className="relative overflow-hidden rounded-[1.35rem] border border-black/[0.07] bg-gradient-to-br from-accent-soft/35 via-mint/30 to-surface px-4 py-5 shadow-card">
          <div
            className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl motion-reduce:opacity-0"
            aria-hidden
          />
          <p className="text-xs text-muted leading-relaxed max-w-prose relative">
            {QURAN_TAFSIR_PREVIEW_HINT}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setTranslationSheetOpen(true)}
        className={cn(
          "md:hidden fixed left-4 z-[44] flex items-center gap-2 rounded-full border border-white/55 bg-surface/95 px-4 py-2.5 shadow-elev-2 backdrop-blur-md ring-4 ring-background/85 text-xs font-bold text-accent",
          floatBottom,
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          ع
        </span>
        Translate
      </button>

      <TranslationPickerSheet
        open={translationSheetOpen}
        onClose={() => setTranslationSheetOpen(false)}
        translations={translations}
        selectedTranslation={selectedTranslation}
        onSelect={(value) => setSelectedTranslation(value)}
      />

      {loading ? (
        <AyahReaderSkeletonBlocks />
      ) : error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : (
        <div
          className={cn(
            readingMode ? "space-y-7" : "space-y-4",
            readingMode &&
              "relative isolate -mx-1 rounded-[1.75rem] bg-gradient-to-b from-background via-surface to-mint/[0.12] px-1.5 py-8 shadow-inner ring-1 ring-accent/10",
            "transition-[box-shadow,background-color,padding] duration-ds",
            "motion-safe:[&>*]:animate-quran-soft-in motion-reduce:[&>*]:animate-none",
          )}
        >
          {verses?.map((v) => (
            <AyahReadingCard
              key={v.verseKey}
              verse={v}
              surahNumber={surahNumber}
              surahDisplayName={surahTitle}
              readingMode={readingMode}
              focusMode={focusMode}
              highlighted={highlightAyah === v.verseNumber}
              hasFavorite={bookmarkKeys.has(
                `${surahNumber}:${v.verseNumber}:favorite`,
              )}
              hasMarker={bookmarkKeys.has(
                `${surahNumber}:${v.verseNumber}:marker`,
              )}
              onToggleFavorite={() => {
                toggleFavoriteAyah(surahNumber, v.verseNumber);
                setBookmarkGen((g) => g + 1);
              }}
              onToggleMarker={() => {
                toggleMarkerAyah(surahNumber, v.verseNumber);
                setBookmarkGen((g) => g + 1);
              }}
              onOpenReflect={() => setReflectAyah(v.verseNumber)}
              onPinTafsirMoment={() => {
                addOrUpdateBookmark({
                  surah: surahNumber,
                  ayah: v.verseNumber,
                  kind: "tafsir",
                  reflection: "",
                });
                setBookmarkGen((g) => g + 1);
              }}
              onOpenTafsir={() => setTafsirAyah({ s: surahNumber, a: v.verseNumber })}
              onListen={() => onListen(surahNumber, v.verseNumber, v)}
            />
          ))}
        </div>
      )}

      <p className="text-[0.7rem] text-muted leading-relaxed px-0.5 pb-4">
        {QURAN_REFLECTION_FOOTER}
      </p>

      <QuranStickyPlayer
        target={audioTarget}
        audioUrl={audioUrl}
        loading={audioLoading}
        error={audioError}
        onDismiss={() => setAudioTarget(null)}
      />

      {tafsirSheetEverOpened && tafsirTarget ? (
        <QuranAyahSheet
          open={!!tafsirAyah}
          surah={tafsirTarget.s}
          ayah={tafsirTarget.a}
          onClose={() => setTafsirAyah(null)}
        />
      ) : null}

      <AyahBookmarkReflectSheet
        open={reflectAyah !== null}
        surah={surahNumber}
        ayah={reflectAyah ?? 1}
        initial={
          reflectAyah
            ? listQuranBookmarks().find(
                (b) =>
                  b.surah === surahNumber &&
                  b.ayah === reflectAyah &&
                  b.kind === "reflection",
              ) ?? null
            : null
        }
        onClose={() => setReflectAyah(null)}
        onSaved={() => {
          setBookmarkGen((g) => g + 1);
          refreshMushafMemory();
        }}
      />
    </div>
  );
}
