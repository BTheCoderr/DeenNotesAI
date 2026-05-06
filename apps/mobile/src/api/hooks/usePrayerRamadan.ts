import { useQuery } from "@tanstack/react-query";

import { prayerTodayQueryFromPrefs } from "../../lib/prayer-query";
import { readMobilePrayerLocationPrefs } from "../../lib/mobile-prayer-prefs";
import { fetchPrayerRamadan } from "../prayer";

export const prayerRamadanQueryKey = ["prayer", "ramadan"] as const;

type Opts = { hijriYear?: number; enabled?: boolean };

export function usePrayerRamadan(opts?: Opts) {
  const hijriYear = opts?.hijriYear;
  const enabled = opts?.enabled ?? true;

  return useQuery({
    queryKey: [...prayerRamadanQueryKey, hijriYear ?? "auto"] as const,
    queryFn: async () => {
      const stored = await readMobilePrayerLocationPrefs();
      const q = prayerTodayQueryFromPrefs(stored);
      return fetchPrayerRamadan(
        typeof hijriYear === "number" ? { ...q, hijriYear } : q,
      );
    },
    staleTime: 3_600_000,
    enabled,
  });
}
