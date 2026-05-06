import { useQuery } from "@tanstack/react-query";

import { fetchChapters } from "../quran";

export const chaptersQueryKey = ["quran", "chapters"] as const;

export function useChapters() {
  return useQuery({
    queryKey: chaptersQueryKey,
    queryFn: () => fetchChapters(),
    staleTime: 3600_000,
  });
}
