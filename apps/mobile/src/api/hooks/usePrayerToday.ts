import { useQuery } from "@tanstack/react-query";

import { LOCATION_FALLBACK } from "../../contracts/prayer-preferences";
import { readMobilePrayerLocationPrefs } from "../../lib/mobile-prayer-prefs";
import { fetchPrayerToday } from "../prayer";

import type { PrayerTodayQuery } from "../prayer";

export const prayerTodayQueryKey = ["prayer", "today"] as const;

export function usePrayerToday() {
  return useQuery({
    queryKey: prayerTodayQueryKey,
    queryFn: async () => {
      const stored = await readMobilePrayerLocationPrefs();
      const q: PrayerTodayQuery = stored ?? {
        city: LOCATION_FALLBACK.city,
        country: LOCATION_FALLBACK.country,
        region: LOCATION_FALLBACK.region,
        method: 2,
        school: 0,
      };
      return fetchPrayerToday(q);
    },
    staleTime: 60_000,
  });
}
