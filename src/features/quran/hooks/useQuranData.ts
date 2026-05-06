"use client";

import { useCallback, useEffect, useState } from "react";

import type { ChapterDto, VerseDto } from "@/lib/quran/types";

type ApiErr = { error?: string };

export function useQuranChapters() {
  const [chapters, setChapters] = useState<ChapterDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quran/chapters", { cache: "no-store" });
      const data = (await res.json()) as { chapters?: ChapterDto[] } & ApiErr;
      if (!res.ok) {
        setError(data.error ?? "Could not load surahs.");
        setChapters([]);
        return;
      }
      setChapters(data.chapters ?? []);
    } catch {
      setError("Network error loading surahs.");
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { chapters, error, loading, reload };
}

export function useQuranChapterMeta(surahNumber: number) {
  const [chapter, setChapter] = useState<ChapterDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/quran/chapter/${surahNumber}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { chapter?: ChapterDto } & ApiErr;
        if (!res.ok || !data.chapter) {
          if (!cancel)
            setError(data.error ?? "Could not load surah.");
          if (!cancel) setChapter(null);
          return;
        }
        if (!cancel) setChapter(data.chapter);
      } catch {
        if (!cancel) {
          setError("Network error.");
          setChapter(null);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [surahNumber]);

  return { chapter, error, loading };
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
        const data = (await res.json()) as {
          translations?: TranslationCatalogItem[];
        };
        setItems(data.translations ?? []);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  return items;
}

export function useQuranVerses(surahNumber: number, queryPart: string) {
  const [verses, setVerses] = useState<VerseDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/quran/chapters/${surahNumber}/verses${queryPart}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { verses?: VerseDto[] } & ApiErr;
      if (!res.ok) {
        setError(data.error ?? "Could not load ayat.");
        setVerses([]);
        return;
      }
      setVerses(data.verses ?? []);
    } catch {
      setError("Network error.");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [queryPart, surahNumber]);

  useEffect(() => {
    void load();
  }, [load]);

  return { verses, error, loading, reload: load };
}
