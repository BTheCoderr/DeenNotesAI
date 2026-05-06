import { useQuery } from "@tanstack/react-query";

import { useChapters } from "../api/hooks/useChapters";
import { pickDailyAyahRef, stableLocalDaySeed } from "../lib/daily-ayah";
import { readCachedChapterVerses, verseGlanceFromCache } from "../lib/quran-offline-cache";

export function useDailyAyahGlance() {
  const { data } = useChapters();
  const chapters = data?.chapters ?? [];
  const dayKey = stableLocalDaySeed(new Date());

  return useQuery({
    queryKey: ["glance", "dailyAyah", dayKey, chapters.length],
    staleTime: 86_400_000,

    queryFn: async () => {
      const ref = pickDailyAyahRef(dayKey, chapters);
      const cached = await readCachedChapterVerses(ref.surahId);
      const glance = verseGlanceFromCache(ref.ayah, cached);
      const meta = chapters.find((c) => c.id === ref.surahId);
      return {
        ref,
        surahName: meta?.translatedName ?? meta?.nameSimple ?? null,
        ...glance,
      };
    },
  });
}
