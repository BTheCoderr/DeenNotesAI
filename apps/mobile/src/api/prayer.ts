import { apiUrl } from "../lib/apiBase";

import type { PrayerTodayResponse } from "./types";

export type PrayerTodayQuery = {
  city?: string;
  country?: string;
  region?: string;
  method?: number;
  school?: 0 | 1;
  adjustment?: number;
  latitude?: number;
  longitude?: number;
};

export async function fetchPrayerToday(
  params: PrayerTodayQuery,
): Promise<PrayerTodayResponse> {
  const qs = new URLSearchParams();
  if (
    typeof params.latitude === "number" &&
    typeof params.longitude === "number"
  ) {
    qs.set("latitude", String(params.latitude));
    qs.set("longitude", String(params.longitude));
  } else {
    if (params.city) qs.set("city", params.city);
    if (params.country) qs.set("country", params.country);
    if (params.region) qs.set("region", params.region);
  }
  qs.set("method", String(params.method ?? 2));
  qs.set("school", String(params.school ?? 0));
  if (typeof params.adjustment === "number") {
    qs.set("adjustment", String(params.adjustment));
  }

  const url = `${apiUrl(`/api/prayer/today`)}?${qs.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as PrayerTodayResponse;
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String((data as { error?: string }).error)
        : "Prayer times request failed.",
    );
  }
  return data;
}
