import "server-only";

import type { Chapter as SdkChapter, ChapterId } from "@quranjs/api";

import { logQuranSdkError, withQuranSdk } from "./client";
import { usesOfflineQuranDataset } from "./config";
import {
  mockChapterById,
  mockChaptersSorted,
} from "./mock/mock-data";
import type { ChapterDto } from "./types";

function chapterToDto(c: SdkChapter): ChapterDto {
  return {
    id: c.id,
    versesCount: c.versesCount,
    revelationPlace: c.revelationPlace,
    revelationOrder: c.revelationOrder,
    nameSimple: c.nameSimple,
    nameArabic: c.nameArabic,
    translatedName: c.translatedName?.name,
    transliteratedName: c.transliteratedName,
  };
}

export async function fetchChaptersSorted(): Promise<ChapterDto[]> {
  if (usesOfflineQuranDataset()) return mockChaptersSorted();
  try {
    const list = await withQuranSdk((c) => c.content.v4.chapters.list({}));
    return [...list].sort((a, b) => a.id - b.id).map(chapterToDto);
  } catch (e) {
    logQuranSdkError("fetchChaptersSorted", e);
    throw e;
  }
}

export async function fetchChapterById(
  chapterId: number,
): Promise<ChapterDto | null> {
  if (usesOfflineQuranDataset()) return mockChapterById(chapterId);

  try {
    if (chapterId < 1 || chapterId > 114) return null;
    const chapter = await withQuranSdk((c) =>
      c.content.v4.chapters.get(String(chapterId) as ChapterId, {}),
    );
    return chapterToDto(chapter);
  } catch (e) {
    logQuranSdkError("fetchChapterById", e);
    throw e;
  }
}
