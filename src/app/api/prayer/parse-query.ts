import {
  PRAYER_FALLBACK_LOCATION,
  isValidLatitude,
  isValidLongitude,
} from "@/lib/prayer/location";
import { coerceCalculationMethod } from "@/lib/prayer/types";

export type ParsedPrayerLocation =
  | {
      mode: "coords";
      latitude: number;
      longitude: number;
    }
  | {
      mode: "city";
      city: string;
      country: string;
      region?: string;
    };

export type ParsedPrayerQuery = ParsedPrayerLocation & {
  method: number;
  school: 0 | 1;
  adjustment: number;
};

export function parsePrayerQuery(sp: URLSearchParams): ParsedPrayerQuery | { error: string } {
  const methodRaw = sp.get("method");
  let method =
    methodRaw !== null && methodRaw.trim() !== ""
      ? coerceCalculationMethod(Number(methodRaw))
      : coerceCalculationMethod(2);

  const schoolRaw = sp.get("school");
  let school: 0 | 1 = 0;
  if (schoolRaw === "1") school = 1;
  else if (schoolRaw === "0") school = 0;
  else if (schoolRaw !== null && schoolRaw.trim() !== "") {
    return { error: "Invalid school — use 0 (Shāfi‘ī standard) or 1 (Hanafi)." };
  }

  const adjRaw = sp.get("adjustment");
  let adjustment = 0;
  if (adjRaw !== null && adjRaw.trim() !== "") {
    const a = Number(adjRaw);
    if (!Number.isFinite(a)) return { error: "Invalid adjustment." };
    adjustment = Math.trunc(Math.max(-6, Math.min(6, a)));
  }

  const latRaw = sp.get("latitude");
  const lngRaw = sp.get("longitude");
  const hasCoords =
    latRaw !== null &&
    latRaw.trim() !== "" &&
    lngRaw !== null &&
    lngRaw.trim() !== "";

  if (hasCoords) {
    const latitude = Number(latRaw);
    const longitude = Number(lngRaw);
    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return { error: "Invalid coordinates." };
    }
    return { mode: "coords", latitude, longitude, method, school, adjustment };
  }

  const city = sp.get("city")?.trim() || PRAYER_FALLBACK_LOCATION.city;
  const country = sp.get("country")?.trim() || PRAYER_FALLBACK_LOCATION.country;
  const region = sp.get("region")?.trim() || PRAYER_FALLBACK_LOCATION.region;

  return {
    mode: "city",
    city,
    country,
    region,
    method,
    school,
    adjustment,
  };
}
