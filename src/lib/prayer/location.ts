/**
 * Location primitives shared by web routes and future Expo adapters.
 */
import { LOCATION_FALLBACK } from "@/shared/prayer-preferences";

export type PrayerFallbackLocation = {
  city: string;
  region: string;
  country: string;
  /** Combined for display — never emits coordinates */
  label: string;
};

export const PRAYER_FALLBACK_LOCATION: PrayerFallbackLocation = {
  city: LOCATION_FALLBACK.city,
  region: LOCATION_FALLBACK.region,
  country: LOCATION_FALLBACK.country,
  label: "Providence, Rhode Island, United States",
};

export function formatCityCountryLabel(city: string, country: string, region?: string): string {
  const c = city.trim();
  const co = country.trim();
  const r = region?.trim();
  if (!c && !co) return PRAYER_FALLBACK_LOCATION.label;
  if (r && c && co) return `${c}, ${r}, ${co}`;
  if (c && co) return `${c}, ${co}`;
  return c || co || PRAYER_FALLBACK_LOCATION.label;
}

export function isValidLatitude(lat: unknown): lat is number {
  return typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lng: unknown): lng is number {
  return typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}
