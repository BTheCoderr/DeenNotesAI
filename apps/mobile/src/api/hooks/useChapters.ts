import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchChapters } from "../quran";

import type { QuranPublicApiMeta } from "../types";
import {
  readChaptersSnapshot,
  writeChaptersSnapshot,
  type ChaptersPayload,
} from "../../lib/quran-chapters-snapshot";

export const chaptersQueryKey = ["quran", "chapters"] as const;

export function useChapters() {
  const [fallback, setFallback] = useState<ChaptersPayload | null | undefined>(undefined);

  useEffect(() => {
    void readChaptersSnapshot().then((snap) => {
      setFallback(snap ? { chapters: snap.chapters, meta: snap.meta } : null);
    });
  }, []);

  const query = useQuery({
    queryKey: chaptersQueryKey,
    queryFn: async () => {
      const r = await fetchChapters();
      try {
        await writeChaptersSnapshot(r);
      } catch {
        /* best-effort */
      }
      return r;
    },
    staleTime: 3600_000,
    placeholderData:
      fallback === undefined ? undefined : fallback === null ? undefined : fallback,
  });

  const display = query.data ?? (fallback && fallback.chapters.length ? fallback : undefined);

  const isOfflineListFallback =
    query.status === "error" && !query.data && !!fallback?.chapters?.length;

  return {
    ...query,
    data: display,
    chaptersMeta: display?.meta as QuranPublicApiMeta | null | undefined,
    isOfflineListFallback,
  };
}
