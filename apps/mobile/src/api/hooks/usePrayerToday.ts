import { useQuery } from "@tanstack/react-query";

import { prayerTodayQueryFromPrefs } from "../../lib/prayer-query";
import { readMobilePrayerLocationPrefs } from "../../lib/mobile-prayer-prefs";
import { fetchPrayerToday } from "../prayer";

export const prayerTodayQueryKey = ["prayer", "today"] as const;

export function usePrayerToday() {
  return useQuery({
    queryKey: prayerTodayQueryKey,
    queryFn: async () => {
      const stored = await readMobilePrayerLocationPrefs();
      const q = prayerTodayQueryFromPrefs(stored);
      return fetchPrayerToday(q);
    },
    staleTime: 60_000,
    gcTime: 86_400_000,
    refetchOnMount: "always",
  });
}
