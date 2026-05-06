import { useQuery } from "@tanstack/react-query";

import { prayerTodayQueryFromPrefs } from "../../lib/prayer-query";
import { readMobilePrayerLocationPrefs } from "../../lib/mobile-prayer-prefs";
import { fetchPrayerMonth } from "../prayer";

export function prayerMonthQueryKey(year: number, month: number) {
  return ["prayer", "month", year, month] as const;
}

type Opts = { year?: number; month?: number; enabled?: boolean };

export function usePrayerMonth(opts?: Opts) {
  const now = new Date();
  const y = typeof opts?.year === "number" ? opts.year : now.getFullYear();
  const m = typeof opts?.month === "number" ? opts.month : now.getMonth() + 1;
  const enabled = opts?.enabled ?? true;

  return useQuery({
    queryKey: prayerMonthQueryKey(y, m),
    queryFn: async () => {
      const stored = await readMobilePrayerLocationPrefs();
      const q = prayerTodayQueryFromPrefs(stored);
      return fetchPrayerMonth({ ...q, year: y, month: m });
    },
    staleTime: 3_600_000,
    enabled,
  });
}
