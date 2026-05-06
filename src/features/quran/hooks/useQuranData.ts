"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { QuranPublicApiMeta } from "@/lib/quran/api-contract";
import {
  parseQuranErrorPayload,
  quranFetchErrorForApp,
  splitQuranApiJson,
} from "@/lib/quran/api-contract";
import type {
  QuranEncAyaTranslationDto,
  QuranEncLanguageGroupDto,
  QuranEncTranslationListItemDto,
  QuranEncVerseOverlayPayloadDto,
} from "@/lib/quranenc/types";
import { groupQuranEncTranslationsByLanguage } from "@/lib/quranenc/grouping";

import type { ChapterDto, VerseDto } from "@/lib/quran/types";

export function useQuranChapters() {
  const [chapters, setChapters] = useState<ChapterDto[] | null>(null);
  const [serviceMeta, setServiceMeta] = useState<QuranPublicApiMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryable(false);
    try {
      const res = await fetch("/api/quran/chapters", { cache: "no-store" });
      let rawUnknown: unknown;
      try {
        rawUnknown = await res.json();
      } catch {
        rawUnknown = null;
      }

      const { meta } = splitQuranApiJson<Record<string, unknown>>(rawUnknown);
      setServiceMeta(meta);

      if (!res.ok) {
        const pe = parseQuranErrorPayload(rawUnknown);
        setError(quranFetchErrorForApp(rawUnknown));
        setRetryable(Boolean(pe.retryable));
        setChapters([]);
        return;
      }

      const { data } = splitQuranApiJson<{ chapters?: ChapterDto[] }>(
        rawUnknown,
      );
      setChapters(data.chapters ?? []);
    } catch {
      setError("Network interruption — check your connection and try again.");
      setRetryable(true);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    chapters,
    serviceMeta,
    error,
    retryable,
    loading,
    reload,
  };
}

export function useQuranChapterMeta(surahNumber: number) {
  const [chapter, setChapter] = useState<ChapterDto | null>(null);
  const [serviceMeta, setServiceMeta] = useState<QuranPublicApiMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryable(false);
    try {
      const res = await fetch(`/api/quran/chapter/${surahNumber}`, {
        cache: "no-store",
      });
      let rawUnknown: unknown;
      try {
        rawUnknown = await res.json();
      } catch {
        rawUnknown = null;
      }

      const { meta } = splitQuranApiJson<Record<string, unknown>>(rawUnknown);
      setServiceMeta(meta);

      if (!res.ok) {
        const pe = parseQuranErrorPayload(rawUnknown);
        setError(quranFetchErrorForApp(rawUnknown));
        setRetryable(Boolean(pe.retryable));
        setChapter(null);
        return;
      }

      const { data } = splitQuranApiJson<{ chapter?: ChapterDto | null }>(
        rawUnknown,
      );
      if (!data.chapter) {
        setError("Surah listing could not be resolved.");
        setChapter(null);
        return;
      }
      setChapter(data.chapter);
    } catch {
      setError("Network interruption.");
      setRetryable(true);
      setChapter(null);
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { chapter, serviceMeta, error, loading, retryable, reload };
}

export type TranslationCatalogItem = {
  id?: number;
  languageName?: string;
  name?: string;
};

export function useTranslationCatalog() {
  const [items, setItems] = useState<TranslationCatalogItem[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/quran/translations", {
          cache: "force-cache",
        });
        const rawUnknown: unknown = await res.json().catch(() => ({}));
        const { data } = splitQuranApiJson<{
          translations?: TranslationCatalogItem[];
        }>(rawUnknown);
        setItems(Array.isArray(data.translations) ? data.translations : []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  return items;
}

export function useQuranVerses(surahNumber: number, queryPart: string) {
  const [verses, setVerses] = useState<VerseDto[] | null>(null);
  const [serviceMeta, setServiceMeta] = useState<QuranPublicApiMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryable(false);
    try {
      const res = await fetch(
        `/api/quran/chapters/${surahNumber}/verses${queryPart}`,
        { cache: "no-store" },
      );
      let rawUnknown: unknown;
      try {
        rawUnknown = await res.json();
      } catch {
        rawUnknown = null;
      }
      const { meta } = splitQuranApiJson<Record<string, unknown>>(rawUnknown);
      setServiceMeta(meta);

      if (!res.ok) {
        const pe = parseQuranErrorPayload(rawUnknown);
        setError(quranFetchErrorForApp(rawUnknown));
        setRetryable(Boolean(pe.retryable));
        setVerses([]);
        return;
      }
      const { data } = splitQuranApiJson<{ verses?: VerseDto[] }>(
        rawUnknown,
      );
      setVerses(data.verses ?? []);
    } catch {
      setError("Network interruption.");
      setRetryable(true);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [queryPart, surahNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  return { verses, serviceMeta, error, loading, retryable, reload: load };
}

function useQuranEncCatalog(displayLocale?: string) {
  const [items, setItems] = useState<QuranEncTranslationListItemDto[]>([]);
  const [languages, setLanguages] = useState<QuranEncLanguageGroupDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const navLocale =
        typeof navigator !== "undefined"
          ? navigator.language?.slice(0, 24) || "en"
          : "en";
      const locale = displayLocale ?? navLocale;
      const res = await fetch(
        `/api/quranenc/translations?list=1&grouped=1&locale=${encodeURIComponent(locale)}`,
        { cache: "force-cache" },
      );
      const rawUnknown: unknown = await res.json().catch(() => ({}));

      type EncPayload = {
        translations?: QuranEncTranslationListItemDto[];
        languages?: QuranEncLanguageGroupDto[];
        error?: string;
      };

      const enc = rawUnknown as EncPayload;
      if (!res.ok) {
        setError(enc.error ?? "QuranEnc catalog unavailable.");
        setItems([]);
        setLanguages([]);
        return;
      }
      const flat = enc.translations ?? [];
      setItems(flat);
      setLanguages(
        enc.languages?.length
          ? enc.languages
          : groupQuranEncTranslationsByLanguage(flat, locale),
      );
      setError(null);
    } catch {
      setError("Network error loading QuranEnc catalog.");
      setItems([]);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  }, [displayLocale]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    items,
    languages,
    error,
    loading,
    reload,
  };
}

/** Multilingual QuranEnc catalogue with language grouping (cached API). */
export function useQuranEncGroupedTranslationCatalog(displayLocale?: string) {
  return useQuranEncCatalog(displayLocale);
}

/** @deprecated Alias — same as {@link useQuranEncGroupedTranslationCatalog}. */
export const useQuranEncTranslationCatalog = useQuranEncGroupedTranslationCatalog;

export function useQuranEncSuraOverlay(
  surahNumber: number,
  translationKey: string | null,
) {
  const [overlay, setOverlay] = useState<QuranEncVerseOverlayPayloadDto | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const byAyah = useMemo(() => {
    const m = new Map<number, QuranEncAyaTranslationDto>();
    for (const row of overlay?.verses ?? []) {
      m.set(row.aya, row);
    }
    return m;
  }, [overlay]);

  useEffect(() => {
    if (!translationKey?.trim()) {
      setOverlay(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancel = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/quranenc/translations?sura=${encodeURIComponent(String(surahNumber))}&translation_key=${encodeURIComponent(translationKey.trim())}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as QuranEncVerseOverlayPayloadDto & {
          error?: string;
        };
        if (!res.ok) {
          if (!cancel) {
            setError(data.error ?? "Could not load QuranEnc translation pack.");
            setOverlay(null);
          }
          return;
        }
        if (!cancel) setOverlay(data);
      } catch {
        if (!cancel) {
          setError("Network error — QuranEnc.");
          setOverlay(null);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [surahNumber, translationKey]);

  return { overlay, byAyah, error, loading };
}
