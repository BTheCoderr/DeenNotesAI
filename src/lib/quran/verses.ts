import "server-only";

import type { ApiParams, ChapterId, Verse, VerseKey } from "@quranjs/api";

import { logQuranSdkError, withQuranSdk } from "./client";
import { parseDefaultTafsirIds, isMockQuranMode } from "./config";
import { maxVerseForChapter } from "./chapter-verse-counts";
import {
  mockVerse,
  mockVersesForChapter,
} from "./mock/mock-data";
import type { VerseDto } from "./types";

function verseToDto(v: Verse): VerseDto {
  const chapterIdRaw = v.chapterId;
  const chapterId =
    typeof chapterIdRaw === "string"
      ? Number(chapterIdRaw)
      : Number(chapterIdRaw ?? 0);

  const translations = (v.translations ?? []).map((t) => ({
    text: t.text,
    resourceId: t.resourceId,
    resourceName: t.resourceName,
    languageName: t.languageName,
  }));

  const tafsirs = (v.tafsirs ?? [])
    .filter((t) => (t.text ?? "").trim().length > 0)
    .map((t) => ({
      text: (t.text ?? "").trim(),
      resourceId: t.resourceId,
      resourceName: t.resourceName,
    }));

  return {
    id: v.id,
    verseNumber: v.verseNumber,
    verseKey: String(v.verseKey),
    chapterId: Number.isFinite(chapterId) ? chapterId : 0,
    pageNumber: v.pageNumber,
    juzNumber: v.juzNumber,
    textUthmani: v.textUthmani ?? v.textImlaei ?? "",
    textImlaei: v.textImlaei,
    translations,
    tafsirs: tafsirs.length ? tafsirs : undefined,
  };
}

/**
 * Parses `2:255`, `2-255`, `_` separators; rejects out-of-Qur’an bounds.
 */
export function parseVerseKeyString(
  raw: string,
): { chapter: number; ayah: number } | null {
  const s = raw.trim();
  const m = /^(\d{1,3})\s*[:_-]\s*(\d{1,3})$/.exec(s);
  if (!m) return null;
  const chapter = Number(m[1]);
  const ayah = Number(m[2]);
  if (
    !Number.isFinite(chapter) ||
    !Number.isFinite(ayah) ||
    chapter !== Math.floor(chapter) ||
    ayah !== Math.floor(ayah) ||
    chapter < 1 ||
    chapter > 114 ||
    ayah < 1
  ) {
    return null;
  }
  const max = maxVerseForChapter(chapter);
  if (!max || ayah > max) return null;
  return { chapter, ayah };
}

export function parseVerseKey(
  chapter: number,
  ayah: number,
): `${number}:${number}` | null {
  if (
    chapter < 1 ||
    chapter > 114 ||
    ayah < 1 ||
    !Number.isFinite(chapter) ||
    !Number.isFinite(ayah)
  ) {
    return null;
  }
  return `${chapter}:${ayah}` as `${number}:${number}`;
}

export type QuranVerseFetchOptions = {
  translationIds?: (string | number)[];
  tafsirIds?: (string | number)[];
};

function mergeVerseQueryParams(opts?: QuranVerseFetchOptions): ApiParams {
  const params: ApiParams = {};
  const tafsirFromEnv = parseDefaultTafsirIds();
  const translations = opts?.translationIds?.filter(
    (id) => id !== "" && id !== undefined,
  );
  const tafsirs = (opts?.tafsirIds?.length ? opts.tafsirIds : tafsirFromEnv)?.filter(
    (id) => id !== "" && id !== undefined,
  );
  if (translations?.length) params.translationIds = translations;
  if (tafsirs?.length) params.tafsirIds = tafsirs;
  return params;
}

export async function fetchVersesForChapter(
  chapterId: number,
  opts?: QuranVerseFetchOptions,
): Promise<VerseDto[]> {
  if (isMockQuranMode()) {
    return mockVersesForChapter(chapterId);
  }

  try {
    if (chapterId < 1 || chapterId > 114) return [];
    const params = mergeVerseQueryParams(opts);
    const verses = await withQuranSdk((c) =>
      c.content.v4.verses.byChapter(
        String(chapterId) as ChapterId,
        params,
      ),
    );
    return verses.map(verseToDto);
  } catch (e) {
    logQuranSdkError("fetchVersesForChapter", e);
    throw e;
  }
}

export async function fetchVerseByKey(
  chapter: number,
  ayah: number,
  opts?: QuranVerseFetchOptions,
): Promise<VerseDto | null> {
  const key = parseVerseKey(chapter, ayah);
  if (!key) return null;

  if (isMockQuranMode()) {
    return mockVerse(chapter, ayah);
  }

  try {
    const params = mergeVerseQueryParams(opts);
    const v = await withQuranSdk((c) =>
      c.content.v4.verses.byKey(key as VerseKey, params),
    );
    return verseToDto(v);
  } catch (e) {
    logQuranSdkError("fetchVerseByKey", e);
    throw e;
  }
}
