/** AlAdhan v1 calculation method ids — keep aligned with web `CALCULATION_METHOD_OPTIONS`. */

export const CALCULATION_METHOD_OPTIONS: { id: number; label: string }[] = [
  { id: 3, label: "Muslim World League" },
  { id: 2, label: "Islamic Society of North America (ISNA)" },
  { id: 4, label: "Umm Al-Qura, Makkah" },
  { id: 5, label: "Egyptian General Authority of Survey" },
  { id: 1, label: "University of Islamic Sciences, Karachi" },
  { id: 15, label: "Moonsighting Committee Worldwide" },
  { id: 16, label: "Dubai (unofficial)" },
  { id: 10, label: "Qatar" },
  { id: 13, label: "Diyanet (Turkey)" },
  { id: 7, label: "Institute of Geophysics, Tehran" },
];

export const MADHAB_OPTIONS: { id: 0 | 1; label: string }[] = [
  { id: 0, label: "Shafi (standard)" },
  { id: 1, label: "Hanafi" },
];

const ALLOWED_METHOD_IDS = new Set(CALCULATION_METHOD_OPTIONS.map((m) => m.id));

export function coerceCalculationMethod(id: unknown): number {
  const n = typeof id === "number" ? id : Number(id);
  if (Number.isFinite(n)) {
    const t = Math.trunc(n);
    if (ALLOWED_METHOD_IDS.has(t)) return t;
    if (t === 11) return 15;
  }
  return 2;
}
