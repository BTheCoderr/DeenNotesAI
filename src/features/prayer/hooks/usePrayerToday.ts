"use client";

import { useCallback, useEffect, useState } from "react";

import type { PrayerPrefsStored } from "@/lib/prayer/prefs-shape";
import type { PrayerTodayPayload } from "@/lib/prayer/types";
import {
  fetchPrayerToday,
  getCoarseGeoForPrayer,
} from "@/features/prayer/prayer-fetch";

/**
 * Thin hook around `/api/prayer/today` — repeats fetches whenever `prefs` identity changes from parent.
 */

export type UsePrayerTodayState = {
  data: PrayerTodayPayload | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function usePrayerToday(prefs: PrayerPrefsStored): UsePrayerTodayState {
  const [data, setData] = useState<PrayerTodayPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const geo =
        prefs.useBrowserLocation && typeof navigator !== "undefined"
          ? await getCoarseGeoForPrayer()
          : null;
      const payload = await fetchPrayerToday({ prefs, geo });
      if (!payload) {
        setError("Prayer times unavailable.");
        setData(null);
      } else {
        setData(payload);
      }
    } catch {
      setError("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [prefs]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    data,
    loading,
    error,
    reload,
  };
}
