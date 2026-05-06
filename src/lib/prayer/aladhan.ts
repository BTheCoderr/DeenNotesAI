import "server-only";

import { formatCityCountryLabel } from "./location";
import {
  CALCULATION_METHOD_OPTIONS,
  coerceCalculationMethod,
  type PrayerCalendarDayDto,
  type PrayerCalendarPayload,
  type PrayerHijriCalendarPayload,
  type PrayerName,
  type PrayerTimingsPayload,
  type PrayerTodayPayload,
} from "./types";

import { computePrayerSchedule } from "./timing-compute";

type AladhanDay = {
  timings: Record<string, string>;
  date: {
    readable?: string;
    hijri?: {
      date?: string;
      month?: { en?: string; number?: string | number };
      year?: string;
      holidays?: string[];
    };
    gregorian?: { date?: string; month?: { number?: number } };
  };
  meta?: {
    timezone?: string;
    method?: { id?: number; name?: string };
    latitude?: number;
    longitude?: number;
  };
};

type AladhanResponse = {
  data?: AladhanDay | AladhanDay[];
  code?: number;
  status?: string;
};

function padGregorianUtc(d: Date) {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yr = String(d.getUTCFullYear());
  return `${day}-${mo}-${yr}`;
}

function tomorrowDdMmYyyyUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return padGregorianUtc(d);
}

export function normalizeTimings(raw: Record<string, string>): Record<PrayerName, string> {
  const pick = (keys: string[]): string => {
    for (const k of keys) {
      const v = raw[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "—";
  };
  return {
    Fajr: pick(["Fajr"]),
    Sunrise: pick(["Sunrise"]),
    Dhuhr: pick(["Dhuhr", "Zuhr"]),
    Asr: pick(["Asr"]),
    Maghrib: pick(["Maghrib"]),
    Isha: pick(["Isha", "Isha'a"]),
  };
}

export function splitTimingsIso(
  raw: Record<string, string>,
): {
  timings: Record<PrayerName, string>;
  timingsIso: Partial<Record<PrayerName, string>>;
} {
  const NAMES: PrayerName[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const base = normalizeTimings(raw);
  const iso: Partial<Record<PrayerName, string>> = {};
  for (const n of NAMES) {
    const v =
      typeof raw[n] === "string"
        ? raw[n]
        : n === "Isha" && typeof raw["Isha'a"] === "string"
          ? raw["Isha'a"]
          : "";
    if (v.includes("T")) {
      const s = v.trim();
      iso[n] = s;
      const m = s.match(/T(\d{2}:\d{2})/);
      if (m?.[1]) base[n] = m[1];
    }
  }
  return { timings: base, timingsIso: iso };
}

function hijriPieces(day: AladhanDay) {
  const h = day.date?.hijri;
  if (!h?.date) {
    return {
      hijriLabel: "—",
      hijriMonthName: undefined as string | undefined,
      hijriDay: undefined as string | undefined,
      hijriMonthNum: undefined as number | undefined,
      hijriYear: undefined as string | undefined,
    };
  }
  const moName = typeof h.month?.en === "string" ? h.month.en : "";
  const moNumRaw = h.month?.number;
  const moNum =
    typeof moNumRaw === "number"
      ? moNumRaw
      : typeof moNumRaw === "string"
        ? Number(moNumRaw)
        : undefined;
  const yr = typeof h.year === "string" ? h.year : "";
  return {
    hijriLabel: [h.date, moName, yr].filter(Boolean).join(" "),
    hijriMonthName: moName || undefined,
    hijriDay: h.date.split("-")[0],
    hijriMonthNum: Number.isFinite(moNum) ? moNum : undefined,
    hijriYear: yr || undefined,
  };
}

function methodLabel(reqId: number, day: AladhanDay): string {
  const fromApi = day.meta?.method?.name?.trim();
  if (fromApi) return fromApi;
  const t = CALCULATION_METHOD_OPTIONS.find((m) => m.id === reqId);
  return t?.label ?? `Method ${reqId}`;
}

async function fetchJson(url: URL): Promise<AladhanResponse | null> {
  const res = await fetch(url.toString(), {
    next: { revalidate: 0 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  try {
    return (await res.json()) as AladhanResponse;
  } catch {
    return null;
  }
}

function aladhanQueryBase(method: number, school: 0 | 1) {
  const m = coerceCalculationMethod(method);
  const q = new URLSearchParams();
  q.set("method", String(m));
  q.set("school", String(school));
  q.set("iso8601", "true");
  if (m === 15) q.set("shafaq", "general");
  return q;
}

function singleDay(day: unknown): AladhanDay | null {
  return day && typeof day === "object" && "timings" in (day as AladhanDay)
    ? (day as AladhanDay)
    : null;
}

export function mapDayToDto(day: AladhanDay): PrayerCalendarDayDto {
  const { timings, timingsIso } = splitTimingsIso(day.timings);
  const hj = hijriPieces(day);
  return {
    gregorianReadable: day.date?.readable ?? "—",
    hijriLabel: hj.hijriLabel,
    hijriMonthNum: hj.hijriMonthNum,
    hijriDay: hj.hijriDay ? Number(hj.hijriDay) : undefined,
    hijriYear: hj.hijriYear,
    timings,
    timingsIso: Object.keys(timingsIso).length ? timingsIso : undefined,
    hijriHolidays: Array.isArray(day.date?.hijri?.holidays)
      ? day.date!.hijri!.holidays!.filter((x) => typeof x === "string")
      : undefined,
  };
}

function buildTimingsPayload(
  day: AladhanDay,
  locationLabel: string,
  requestedMethod: number,
  school: 0 | 1,
): Omit<PrayerTimingsPayload, "ok"> {
  const { timings, timingsIso } = splitTimingsIso(day.timings);
  const hj = hijriPieces(day);
  const tz =
    typeof day.meta?.timezone === "string" && day.meta.timezone.trim()
      ? day.meta.timezone.trim()
      : undefined;
  return {
    locationLabel,
    gregorianDateReadable: day.date?.readable ?? padGregorianUtc(new Date()),
    hijriLabel: hj.hijriLabel,
    hijriMonthName: hj.hijriMonthName,
    hijriDay: hj.hijriDay,
    hijriMonthNum: hj.hijriMonthNum,
    hijriYear: hj.hijriYear,
    timezone: tz,
    methodLabel: methodLabel(requestedMethod, day),
    schoolLabel: school === 1 ? "Hanafi" : "Shāfi‘ī (standard)",
    timings,
    timingsIso: Object.keys(timingsIso).length ? timingsIso : undefined,
  };
}

export async function fetchTodayByCity(opts: {
  city: string;
  country: string;
  method: number;
  school: 0 | 1;
  adjustment?: number;
}): Promise<PrayerTodayPayload | null> {
  const q = aladhanQueryBase(opts.method, opts.school);
  q.set("city", opts.city.trim());
  q.set("country", opts.country.trim());
  if (opts.adjustment != null && opts.adjustment !== 0 && Number.isFinite(opts.adjustment)) {
    q.set("adjustment", String(Math.trunc(opts.adjustment)));
  }
  const segment = padGregorianUtc(new Date());
  const url = new URL(`https://api.aladhan.com/v1/timingsByCity/${segment}`);
  url.search = q.toString();
  const j = await fetchJson(url);
  const day = singleDay(j?.data);
  if (!day) return null;

  const loc = formatCityCountryLabel(opts.city, opts.country);
  const payload = buildTimingsPayload(day, loc, coerceCalculationMethod(opts.method), opts.school);

  let tomorrowFajrIso: string | null = null;
  const qTom = new URLSearchParams(q);
  const urlTom = new URL(
    `https://api.aladhan.com/v1/timingsByCity/${tomorrowDdMmYyyyUtc()}`,
  );
  urlTom.search = qTom.toString();
  const jTom = await fetchJson(urlTom);
  const tomorrow = singleDay(jTom?.data);
  if (tomorrow) {
    const { timingsIso } = splitTimingsIso(tomorrow.timings);
    tomorrowFajrIso = timingsIso.Fajr ?? null;
  }

  const now = Date.now();
  const schedule = computePrayerSchedule(
    payload.timings,
    payload.timingsIso,
    now,
    tomorrowFajrIso,
  );

  const isRamadan = payload.hijriMonthNum === 9;
  const ramadanDay = isRamadan ? Number(payload.hijriDay) : null;

  return {
    ok: true,
    ...payload,
    schedule,
    isRamadanDay: isRamadan,
    ramadanDay: Number.isFinite(ramadanDay as number) ? (ramadanDay as number) : null,
  };
}

export async function fetchTodayByCoords(opts: {
  latitude: number;
  longitude: number;
  method: number;
  school: 0 | 1;
  adjustment?: number;
}): Promise<PrayerTodayPayload | null> {
  const method = coerceCalculationMethod(opts.method);
  const segment = padGregorianUtc(new Date());
  const q = aladhanQueryBase(method, opts.school);
  q.set("latitude", String(opts.latitude));
  q.set("longitude", String(opts.longitude));
  if (opts.adjustment != null && opts.adjustment !== 0 && Number.isFinite(opts.adjustment)) {
    q.set("adjustment", String(Math.trunc(opts.adjustment)));
  }

  const url = new URL(`https://api.aladhan.com/v1/timings/${segment}`);
  url.search = q.toString();

  const j = await fetchJson(url);
  const day = singleDay(j?.data);
  if (!day) return null;

  const payload = buildTimingsPayload(
    day,
    "Approximate area (saved from your device)",
    method,
    opts.school,
  );

  const urlTom = new URL(`https://api.aladhan.com/v1/timings/${tomorrowDdMmYyyyUtc()}`);
  urlTom.search = q.toString();
  const jTom = await fetchJson(urlTom);
  const tomorrow = singleDay(jTom?.data);
  let tomorrowFajrIso: string | null = null;
  if (tomorrow) {
    const { timingsIso } = splitTimingsIso(tomorrow.timings);
    tomorrowFajrIso = timingsIso.Fajr ?? null;
  }

  const now = Date.now();
  const schedule = computePrayerSchedule(
    payload.timings,
    payload.timingsIso,
    now,
    tomorrowFajrIso,
  );

  const isRamadan = payload.hijriMonthNum === 9;

  return {
    ok: true,
    ...payload,
    schedule,
    isRamadanDay: isRamadan,
    ramadanDay:
      isRamadan && payload.hijriDay ? Number(payload.hijriDay) : null,
  };
}

export async function fetchGregorianCalendarByCity(opts: {
  city: string;
  country: string;
  year: number;
  month: number;
  method: number;
  school: 0 | 1;
  adjustment?: number;
}): Promise<PrayerCalendarPayload | null> {
  const method = coerceCalculationMethod(opts.method);
  const url = new URL(
    `https://api.aladhan.com/v1/calendarByCity/${opts.year}/${opts.month}`,
  );
  const q = aladhanQueryBase(method, opts.school);
  q.set("city", opts.city.trim());
  q.set("country", opts.country.trim());
  if (opts.adjustment != null && Number.isFinite(opts.adjustment)) {
    q.set("adjustment", String(opts.adjustment));
  }
  url.search = q.toString();
  const j = await fetchJson(url);
  if (!Array.isArray(j?.data)) return null;
  const first = singleDay(j.data[0]);
  const timezone = first ? safeTz(first) : undefined;
  return {
    ok: true,
    locationLabel: formatCityCountryLabel(opts.city, opts.country),
    year: opts.year,
    month: opts.month,
    timezone,
    days: j!.data!.map((d) => mapDayToDto(d as AladhanDay)),
  };
}

export async function fetchGregorianCalendarByCoords(opts: {
  latitude: number;
  longitude: number;
  year: number;
  month: number;
  method: number;
  school: 0 | 1;
  adjustment?: number;
}): Promise<PrayerCalendarPayload | null> {
  const method = coerceCalculationMethod(opts.method);
  const url = new URL(
    `https://api.aladhan.com/v1/calendar/${opts.year}/${opts.month}`,
  );
  const q = aladhanQueryBase(method, opts.school);
  q.set("latitude", String(opts.latitude));
  q.set("longitude", String(opts.longitude));
  if (opts.adjustment != null && Number.isFinite(opts.adjustment)) {
    q.set("adjustment", String(opts.adjustment));
  }
  url.search = q.toString();
  const j = await fetchJson(url);
  if (!Array.isArray(j?.data)) return null;
  const first = singleDay(j.data[0]);
  return {
    ok: true,
    locationLabel: "Approximate area (from coordinates)",
    year: opts.year,
    month: opts.month,
    timezone: first ? safeTz(first) : undefined,
    days: j!.data!.map((d) => mapDayToDto(d as AladhanDay)),
  };
}

export async function fetchHijriCalendarByCity(opts: {
  city: string;
  country: string;
  hijriYear: number;
  hijriMonth: number;
  method: number;
  school: 0 | 1;
  adjustment?: number;
}): Promise<PrayerHijriCalendarPayload | null> {
  const method = coerceCalculationMethod(opts.method);
  const url = new URL(
    `https://api.aladhan.com/v1/hijriCalendarByCity/${opts.hijriYear}/${opts.hijriMonth}`,
  );
  const q = aladhanQueryBase(method, opts.school);
  q.set("city", opts.city.trim());
  q.set("country", opts.country.trim());
  if (opts.adjustment != null && Number.isFinite(opts.adjustment)) {
    q.set("adjustment", String(opts.adjustment));
  }
  url.search = q.toString();
  const j = await fetchJson(url);
  if (!Array.isArray(j?.data)) return null;
  const first = singleDay(j.data[0]);
  const greg = first?.date?.gregorian;
  const gMo = greg?.month?.number;
  return {
    ok: true,
    locationLabel: formatCityCountryLabel(opts.city, opts.country),
    hijriYear: opts.hijriYear,
    hijriMonth: opts.hijriMonth,
    gregorianMirrorMonth:
      typeof gMo === "number" && Number.isFinite(gMo) ? gMo : undefined,
    days: j!.data!.map((d) => mapDayToDto(d as AladhanDay)),
  };
}

export async function fetchHijriCalendarByCoords(opts: {
  latitude: number;
  longitude: number;
  hijriYear: number;
  hijriMonth: number;
  method: number;
  school: 0 | 1;
  adjustment?: number;
}): Promise<PrayerHijriCalendarPayload | null> {
  const method = coerceCalculationMethod(opts.method);
  const url = new URL(
    `https://api.aladhan.com/v1/hijriCalendar/${opts.hijriYear}/${opts.hijriMonth}`,
  );
  const q = aladhanQueryBase(method, opts.school);
  q.set("latitude", String(opts.latitude));
  q.set("longitude", String(opts.longitude));
  if (opts.adjustment != null && Number.isFinite(opts.adjustment)) {
    q.set("adjustment", String(opts.adjustment));
  }
  url.search = q.toString();
  const j = await fetchJson(url);
  if (!Array.isArray(j?.data)) return null;
  return {
    ok: true,
    locationLabel: "Approximate area (from coordinates)",
    hijriYear: opts.hijriYear,
    hijriMonth: opts.hijriMonth,
    days: j!.data!.map((d) => mapDayToDto(d as AladhanDay)),
  };
}

function safeTz(day: AladhanDay): string | undefined {
  const t = day.meta?.timezone?.trim();
  return t ? t : undefined;
}

type RamadanWindowBase = {
  hijriYear: number;
  method: number;
  school: 0 | 1;
  adjustment?: number;
};

/** Ramadan Gregorian month inferred from Hijri calendar (month 9) for locality. */
export async function fetchRamadanGregorianWindow(
  opts: RamadanWindowBase & ({ city: string; country: string } | { latitude: number; longitude: number }),
): Promise<{
  calendar: PrayerCalendarPayload | null;
  hijriRamadan: PrayerHijriCalendarPayload | null;
}> {
  const adj = opts.adjustment;
  const hijriRamadan =
    "latitude" in opts
      ? await fetchHijriCalendarByCoords({
          latitude: opts.latitude,
          longitude: opts.longitude,
          hijriYear: opts.hijriYear,
          hijriMonth: 9,
          method: opts.method,
          school: opts.school,
          adjustment: adj,
        })
      : await fetchHijriCalendarByCity({
          city: opts.city,
          country: opts.country,
          hijriYear: opts.hijriYear,
          hijriMonth: 9,
          method: opts.method,
          school: opts.school,
          adjustment: adj,
        });
  if (!hijriRamadan?.days.length) {
    return { calendar: null, hijriRamadan };
  }
  const mid = hijriRamadan.days[Math.floor(hijriRamadan.days.length / 2)];
  const gReadable = mid.gregorianReadable;
  /* Best-effort: parse "5 May 2026" via Date */
  const g = new Date(gReadable);
  const year = Number.isFinite(g.getTime()) ? g.getFullYear() : new Date().getFullYear();
  const month =
    Number.isFinite(g.getTime()) ? g.getMonth() + 1 : new Date().getMonth() + 1;
  const calendar =
    "latitude" in opts
      ? await fetchGregorianCalendarByCoords({
          latitude: opts.latitude,
          longitude: opts.longitude,
          year,
          month,
          method: opts.method,
          school: opts.school,
          adjustment: adj,
        })
      : await fetchGregorianCalendarByCity({
          city: opts.city,
          country: opts.country,
          year,
          month,
          method: opts.method,
          school: opts.school,
          adjustment: adj,
        });
  return { calendar, hijriRamadan };
}
