import { captureAppIssue } from "../lib/sentry/mobile";

import {
  fetchGregorianCalendarByCity,
  fetchGregorianCalendarByCoords,
  fetchRamadanGregorianWindow,
  fetchTodayByCity,
  fetchTodayByCoords,
} from "../lib/prayer/aladhan-client";

import type {
  PrayerCalendarPayload,
  PrayerRamadanOk,
  PrayerRamadanResponse,
  PrayerTimingsError,
  PrayerTodayPayload,
  PrayerTodayResponse,
} from "./types";

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

export type PrayerMonthQuery = PrayerTodayQuery & {
  year: number;
  month: number;
};

async function loadTodayPayload(q: PrayerTodayQuery): Promise<PrayerTodayPayload | null> {
  const method = q.method ?? 2;
  const school: 0 | 1 = q.school === 1 ? 1 : 0;
  const adjustment = typeof q.adjustment === "number" ? q.adjustment : undefined;

  const hasCoords =
    typeof q.latitude === "number" &&
    typeof q.longitude === "number" &&
    Number.isFinite(q.latitude) &&
    Number.isFinite(q.longitude);

  if (hasCoords) {
    return fetchTodayByCoords({
      latitude: q.latitude!,
      longitude: q.longitude!,
      method,
      school,
      adjustment,
    });
  }

  const city = (q.city ?? "").trim();
  const country = (q.country ?? "").trim();
  if (!city || !country) return null;

  return fetchTodayByCity({
    city,
    country,
    method,
    school,
    adjustment,
  });
}

/** Direct AlAdhan `GET /v1/timings` or `timingsByCity/{date}` normalized for the Expo client. */
export async function getPrayerTimesToday(q: PrayerTodayQuery): Promise<PrayerTodayResponse> {
  try {
    const data = await loadTodayPayload(q);
    if (!data) {
      return {
        ok: false,
        error: "Prayer times unavailable for this location.",
        code: "UPSTREAM",
      };
    }
    return data;
  } catch (err) {
    captureAppIssue("prayer_fetch_today", err, {
      hasCoords: typeof q.latitude === "number",
    });
    return {
      ok: false,
      error: "Prayer times could not load. Pull to refresh when back online.",
      code: "UPSTREAM",
    };
  }
}

/** AlAdhan `GET /v1/calendar` or `calendarByCity/{year}/{month}`. */
export async function getPrayerCalendarMonth(
  q: PrayerMonthQuery,
): Promise<PrayerCalendarPayload | PrayerTimingsError> {
  const method = q.method ?? 2;
  const school: 0 | 1 = q.school === 1 ? 1 : 0;
  const adjustment = typeof q.adjustment === "number" ? q.adjustment : undefined;
  const hasCoords =
    typeof q.latitude === "number" &&
    typeof q.longitude === "number" &&
    Number.isFinite(q.latitude) &&
    Number.isFinite(q.longitude);

  let data: PrayerCalendarPayload | null = null;
  if (hasCoords) {
    data = await fetchGregorianCalendarByCoords({
      latitude: q.latitude!,
      longitude: q.longitude!,
      year: q.year,
      month: q.month,
      method,
      school,
      adjustment,
    });
  } else {
    const city = (q.city ?? "").trim();
    const country = (q.country ?? "").trim();
    if (!city || !country) {
      return { ok: false, error: "City and country are required without coordinates.", code: "INVALID" };
    }
    data = await fetchGregorianCalendarByCity({
      city,
      country,
      year: q.year,
      month: q.month,
      method,
      school,
      adjustment,
    });
  }

  if (!data) {
    return { ok: false, error: "Calendar unavailable.", code: "UPSTREAM" };
  }
  return data;
}

/** AlAdhan hijri calendar `hijriCalendar` + Gregorian overlap for Ramaḍān context. */
export async function getRamadanCalendar(
  q: PrayerTodayQuery & { hijriYear?: number },
): Promise<PrayerRamadanResponse> {
  const method = q.method ?? 2;
  const school: 0 | 1 = q.school === 1 ? 1 : 0;
  const adjustment = typeof q.adjustment === "number" ? q.adjustment : undefined;

  let hijriYear =
    typeof q.hijriYear === "number" && Number.isFinite(q.hijriYear) ? Math.trunc(q.hijriYear) : NaN;

  if (!Number.isFinite(hijriYear)) {
    const today = await loadTodayPayload(q);
    const y = Number(today?.hijriYear);
    hijriYear = Number.isFinite(y) ? y : new Date().getFullYear() - 622;
  }

  const hasCoords =
    typeof q.latitude === "number" &&
    typeof q.longitude === "number" &&
    Number.isFinite(q.latitude) &&
    Number.isFinite(q.longitude);

  let pack;
  if (hasCoords && q.latitude != null && q.longitude != null) {
    pack = await fetchRamadanGregorianWindow({
      latitude: q.latitude,
      longitude: q.longitude,
      hijriYear,
      method,
      school,
      adjustment,
    });
  } else {
    const city = (q.city ?? "").trim();
    const country = (q.country ?? "").trim();
    if (!city || !country) {
      return { ok: false, error: "City and country are required without coordinates.", code: "INVALID" };
    }
    pack = await fetchRamadanGregorianWindow({
      city,
      country,
      hijriYear,
      method,
      school,
      adjustment,
    });
  }

  if (!pack.hijriRamadan && !pack.calendar) {
    return { ok: false, error: "Ramadan data unavailable.", code: "UPSTREAM" };
  }

  return {
    ok: true,
    hijriYear,
    gregorianMonth: pack.calendar?.month ?? null,
    gregorianYear: pack.calendar?.year ?? null,
    hijriRamadan: pack.hijriRamadan as unknown as PrayerRamadanOk["hijriRamadan"],
    gregorianOverlap: pack.calendar as PrayerRamadanOk["gregorianOverlap"],
  };
}

/** @deprecated Use getPrayerTimesToday — kept for incremental refactors. */
export async function fetchPrayerToday(params: PrayerTodayQuery): Promise<PrayerTodayResponse> {
  return getPrayerTimesToday(params);
}

/** @deprecated Use getPrayerCalendarMonth */
export async function fetchPrayerMonth(params: PrayerMonthQuery): Promise<PrayerCalendarPayload> {
  const res = await getPrayerCalendarMonth(params);
  if (!res.ok) {
    throw new Error(res.error);
  }
  return res;
}

/** @deprecated Use getRamadanCalendar */
export async function fetchPrayerRamadan(
  params: PrayerTodayQuery & { hijriYear?: number },
): Promise<PrayerRamadanResponse> {
  return getRamadanCalendar(params);
}
