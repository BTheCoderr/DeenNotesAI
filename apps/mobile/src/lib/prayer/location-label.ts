import { LOCATION_FALLBACK } from "../../contracts/prayer-preferences";

const FALLBACK_LABEL = "Providence, Rhode Island, United States";

export function formatCityCountryLabel(city: string, country: string, region?: string): string {
  const c = city.trim();
  const co = country.trim();
  const r = region?.trim();
  if (!c && !co) return FALLBACK_LABEL;
  if (r && c && co) return `${c}, ${r}, ${co}`;
  if (c && co) return `${c}, ${co}`;
  return c || co || FALLBACK_LABEL;
}

export function fallbackManualLabelParts() {
  return {
    city: LOCATION_FALLBACK.city,
    region: LOCATION_FALLBACK.region,
    country: LOCATION_FALLBACK.country,
    label: FALLBACK_LABEL,
  };
}
