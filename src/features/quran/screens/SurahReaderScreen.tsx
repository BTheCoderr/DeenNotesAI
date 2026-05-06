"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AyahReadingCard } from "@/features/quran/components/AyahReadingCard";
import { AyahBookmarkReflectSheet } from "@/features/quran/components/AyahBookmarkReflectSheet";
import { LanguageAudioPlayer } from "@/components/quran/LanguageAudioPlayer";
import { QuranAyahSheet } from "@/features/quran/components/QuranAyahSheet";
import { AyahReaderSkeletonBlocks } from "@/features/quran/components/QuranSkeletons";
import { QuranServiceEmptyState } from "@/features/quran/components/QuranServiceEmptyState";
import type { QuranAudioTarget } from "@/features/quran/components/QuranStickyPlayer";
import { QuranStickyPlayer } from "@/features/quran/components/QuranStickyPlayer";
import { TranslationPickerSheet } from "@/features/quran/components/TranslationPickerSheet";
import {
  useQuranChapterMeta,
  useQuranEncGroupedTranslationCatalog,
  useQuranEncSuraOverlay,
  useQuranVerses,
  useTranslationCatalog,
} from "@/features/quran/hooks/useQuranData";
import {
  readOfflineReadingPrepIntent,
  readPreferredQuranEncTranslationKey,
  writeOfflineReadingPrepIntent,
} from "@/lib/browser/quranenc-preference";
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
import { offlineReflectionSubtitle } from "@/lib/quran/api-contract";
import { readPreferredTranslationIds } from "@/lib/quran/translation-preference";
import {
  QURANENC_ATTRIBUTION_LINE,
  QURANENC_HOME_URL,
  QURANENC_TERMS_URL,
} from "@/lib/quranenc/types";
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
  const {
    languages: quranEncLanguageGroups,
    error: quranEncCatalogError,
  } = useQuranEncGroupedTranslationCatalog();
  const [translationSheetOpen, setTranslationSheetOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("pref");
  const [selectedQuranEncKey, setSelectedQuranEncKey] = useState<string | null>(
    null,
  );
  const [offlinePrepIntent, setOfflinePrepIntent] = useState(false);
  const [tafsirAyah, setTafsirAyah] = useState<{ s: number; a: number } | null>(
    null,
  );
  const tafsirTargetRef = useRef<{ s: number; a: number } | null>(null);

  useEffect(() => {
    if (tafsirAyah) tafsirTargetRef.current = tafsirAyah;
  }, [tafsirAyah]);

  const tafsirTarget = tafsirAyah ?? tafsirTargetRef.current;
  const tafsirSheetEverOpened = tafsirTargetRef.current !== null;

  useEffect(() => {
    const stored = readPreferredQuranEncTranslationKey();
    setSelectedQuranEncKey(stored ? stored : null);
    setOfflinePrepIntent(readOfflineReadingPrepIntent());
  }, []);

  const {
    byAyah: qeByAyah,
    overlay: qeOverlay,
    error: qeOverlayError,
    loading: qeOverlayLoading,
  } = useQuranEncSuraOverlay(surahNumber, selectedQuranEncKey);

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

  const {
    verses,
    error,
    loading,
    reload: reloadVerses,
    retryable: versesRetryable,
    serviceMeta: versesServiceMeta,
  } = useQuranVerses(surahNumber, queryPart);

  const verseOfflineBanner = useMemo(
    () => offlineReflectionSubtitle(versesServiceMeta ?? null),
    [versesServiceMeta],
  );

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
  const [playerAttributionLine, setPlayerAttributionLine] = useState<string | null>(
    null,
  );
  const [playerSourceLabel, setPlayerSourceLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!audioTarget) {
      setAudioUrl(null);
      setAudioError(null);
      setPlayerAttributionLine(null);
      setPlayerSourceLabel(null);
      return;
    }

    const isQe =
      audioTarget.audioSource === "quranenc_translation" &&
      Boolean(audioTarget.quranEncTranslationKey?.trim());

    if (isQe) {
      let cancel = false;
      setAudioLoading(true);
      setAudioError(null);
      setPlayerSourceLabel("Translation narration · QuranEnc");
      setPlayerAttributionLine(QURANENC_ATTRIBUTION_LINE);
      void (async () => {
        try {
          const key = String(audioTarget.quranEncTranslationKey).trim();
          const res = await fetch(
            `/api/quranenc/audio?${new URLSearchParams({
              translation_key: key,
              sura: String(audioTarget.surah),
              aya: String(audioTarget.ayah),
            })}`,
            { cache: "force-cache" },
          );
          const j = (await res.json()) as {
            audioUrl?: string;
            error?: string;
            available?: boolean;
            attributionLine?: string;
          };
          if (cancel) return;
          if (j.attributionLine) setPlayerAttributionLine(j.attributionLine);
          if (!res.ok) {
            setAudioError(j.error ?? "Could not resolve translation audio.");
            setAudioUrl(null);
            return;
          }
          const url = j.audioUrl?.trim() ?? "";
          if (!j.available || !url) {
            setAudioError(
              "Translation audio is not available here (offline mock or CDN blocked). QuranEnc terms still apply when text is shown.",
            );
            setAudioUrl(null);
            return;
          }
          setAudioUrl(url);
          setAudioError(null);
        } catch {
          if (!cancel) {
            setAudioError("Translation audio request failed.");
            setAudioUrl(null);
          }
        } finally {
          if (!cancel) setAudioLoading(false);
        }
      })();
      return () => {
        cancel = true;
      };
    }

    let cancel = false;
    setAudioLoading(true);
    setAudioError(null);
    setPlayerAttributionLine(null);
    setPlayerSourceLabel("Recitation preview · Quran Foundation");
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
        audioSource: "recitation",
      });
    },
    [chapter?.nameSimple],
  );

  const onListenQuranEnc = useCallback(
    (surah: number, ayah: number, verse: VerseDto) => {
      if (!selectedQuranEncKey?.trim()) return;
      const label = chapter?.nameSimple?.trim();
      setAudioTarget({
        surah,
        ayah,
        verse,
        chapterLabel: label ? `${label} · Ayah ${ayah}` : undefined,
        audioSource: "quranenc_translation",
        quranEncTranslationKey: selectedQuranEncKey.trim(),
      });
    },
    [chapter?.nameSimple, selectedQuranEncKey],
  );

  const qeMetaLine = useMemo(() => {
    if (!qeOverlay) return "";
    const bits = [
      qeOverlay.translationTitle?.trim(),
      qeOverlay.translationKey ? `key ${qeOverlay.translationKey}` : null,
      qeOverlay.translationVersion != null && qeOverlay.translationVersion !== ""
        ? `v${qeOverlay.translationVersion}`
        : null,
      qeOverlay.languageIso?.trim()
        ? qeOverlay.languageIso.trim().toUpperCase()
        : null,
    ].filter(Boolean) as string[];
    return bits.join(" · ");
  }, [qeOverlay]);

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
            <label className="hidden sm:flex items-center gap-1.5 rounded-full border border-black/10 bg-background/90 px-2 py-1.5 text-[0.58rem] font-semibold uppercase tracking-wide text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-accent rounded border-black/20"
                checked={offlinePrepIntent}
                onChange={(e) => {
                  const on = e.target.checked;
                  writeOfflineReadingPrepIntent(on);
                  setOfflinePrepIntent(on);
                }}
              />
              Offline prep
            </label>
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

        <label className="sm:hidden flex items-center justify-between gap-3 rounded-[1.25rem] border border-black/[0.08] bg-surface px-4 py-3 text-sm">
          <span className="text-muted leading-snug">
            <strong className="text-ink">Download for offline reading</strong>
            <span className="block text-xs mt-0.5">
              Saves your intent for a future sync job — packs are not written yet.
            </span>
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-accent rounded border-black/20 shrink-0"
            checked={offlinePrepIntent}
            onChange={(e) => {
              const on = e.target.checked;
              writeOfflineReadingPrepIntent(on);
              setOfflinePrepIntent(on);
            }}
            aria-label="Prepare surah packs for offline reading"
          />
        </label>

        {offlinePrepIntent ? (
          <p className="rounded-2xl border border-accent/20 bg-accent-soft/25 px-4 py-3 text-xs text-ink/90">
            Offline prep is on — we will hydrate translation JSON, Mushaf glyphs, and permitted
            QuranEnc audio pointers when the background sync ships (Expo-friendly).
          </p>
        ) : null}

        {qeOverlayError ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950">
            {qeOverlayError}
          </p>
        ) : null}
        {qeOverlayLoading && selectedQuranEncKey ? (
          <p className="text-[0.7rem] text-muted px-1">Loading QuranEnc surah pack…</p>
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
        quranEncLanguageGroups={quranEncLanguageGroups}
        selectedQuranEncKey={selectedQuranEncKey}
        onSelectQuranEncKey={(key) => setSelectedQuranEncKey(key)}
        quranEncCatalogError={quranEncCatalogError}
      />

      {verseOfflineBanner ? (
        <p className="rounded-2xl border border-accent/20 bg-accent-soft/25 px-4 py-3 text-[0.7rem] text-ink leading-relaxed">
          {verseOfflineBanner}
        </p>
      ) : null}

      {loading ? (
        <AyahReaderSkeletonBlocks />
      ) : error ? (
        <QuranServiceEmptyState
          title="Verses paused for this surah"
          description={error}
          serviceMeta={versesServiceMeta}
          retryable={versesRetryable}
          onReconnect={versesRetryable ? () => void reloadVerses() : undefined}
        />
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
          {verses?.map((v) => {
            const qeRow = selectedQuranEncKey
              ? qeByAyah.get(v.verseNumber)
              : undefined;
            const quranEncBlock =
              qeRow && selectedQuranEncKey
                ? {
                    translation: qeRow.translation,
                    footnotes: qeRow.footnotes,
                    metaLine:
                      qeMetaLine.trim() ||
                      (qeOverlay?.translationKey
                        ? `key ${qeOverlay.translationKey}`
                        : `key ${selectedQuranEncKey}`),
                  }
                : null;
            return (
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
              quranEncBlock={quranEncBlock}
              onListenQuranEnc={
                selectedQuranEncKey
                  ? () => onListenQuranEnc(surahNumber, v.verseNumber, v)
                  : undefined
              }
            />
            );
          })}
        </div>
      )}

      <div className="space-y-3 px-0.5 pb-4">
        {selectedQuranEncKey ? (
          <p className="text-[0.68rem] text-muted leading-relaxed border-t border-black/[0.06] pt-4">
            {QURANENC_ATTRIBUTION_LINE}{" "}
            <a
              href={QURANENC_TERMS_URL}
              className="text-accent underline-offset-2 hover:underline font-medium"
              target="_blank"
              rel="noreferrer"
            >
              Terms & policies
            </a>
            {" · "}
            <a
              href={QURANENC_HOME_URL}
              className="text-accent underline-offset-2 hover:underline font-medium"
              target="_blank"
              rel="noreferrer"
            >
              QuranEnc
            </a>
            {qeOverlay?.translationVersion != null && qeOverlay.translationVersion !== "" ? (
              <span className="block mt-1 text-[0.62rem] text-muted/90">
                Active pack metadata: {qeOverlay.translationKey} · v
                {qeOverlay.translationVersion}
              </span>
            ) : selectedQuranEncKey ? (
              <span className="block mt-1 text-[0.62rem] text-muted/90">
                Active translation key: {qeOverlay?.translationKey ?? selectedQuranEncKey}
              </span>
            ) : null}
          </p>
        ) : null}
        <p className="text-[0.7rem] text-muted leading-relaxed">
          {QURAN_REFLECTION_FOOTER}
        </p>
      </div>

      {audioTarget?.audioSource === "quranenc_translation" ? (
        <LanguageAudioPlayer
          visible
          ayahCaption={
            audioTarget.chapterLabel ??
            `Surah ${audioTarget.surah} · Ayah ${audioTarget.ayah}`
          }
          audioUrl={audioUrl}
          loading={audioLoading}
          error={audioError}
          attributionLine={playerAttributionLine}
          translationKeyLabel={selectedQuranEncKey}
          onDismiss={() => setAudioTarget(null)}
        />
      ) : (
        <QuranStickyPlayer
          target={audioTarget}
          audioUrl={audioUrl}
          loading={audioLoading}
          error={audioError}
          audioSourceLabel={playerSourceLabel}
          attributionLine={playerAttributionLine}
          onDismiss={() => setAudioTarget(null)}
        />
      )}

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
