import { useQuery } from "@tanstack/react-query";

import { readOfflineReadingPreferences } from "../../lib/offline-reading-prefs-storage";
import { cacheChapterVersesResponse } from "../../lib/quran-offline-cache";
import { fetchChapterVerses } from "../quran";

export const chapterVersesQueryKey = (chapterId: number) =>
  ["quran", "chapter", chapterId, "verses"] as const;

export function useChapterVerses(chapterId: number | null) {
  const enabled = typeof chapterId === "number" && chapterId >= 1 && chapterId <= 114;

  return useQuery({
    queryKey:
      typeof chapterId === "number"
        ? chapterVersesQueryKey(chapterId)
        : ["quran", "chapter", "none", "verses"],
    queryFn: async () => {
      const data = await fetchChapterVerses(chapterId as number);
      try {
        const off = await readOfflineReadingPreferences();
        if (off.cacheEnabled) {
          void cacheChapterVersesResponse(chapterId as number, data, off.maxCachedSurahs);
        }
      } catch {
        /* cache is best-effort */
      }
      return data;
    },
    staleTime: 1_800_000,
    enabled,
  });
}
