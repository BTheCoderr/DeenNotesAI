/** Kaaba coordinates (Masjid al-Haram, Makkah). */
export const KAABA_LATITUDE = 21.4225;
export const KAABA_LONGITUDE = 39.8262;

const DEG = Math.PI / 180;

/**
 * Initial bearing from a point on Earth to the Kaaba, in degrees clockwise from true north (0–360).
 */
export function bearingToKaaba(latitude: number, longitude: number): number {
  const lat1 = latitude * DEG;
  const lat2 = KAABA_LATITUDE * DEG;
  const dLon = (KAABA_LONGITUDE - longitude) * DEG;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) / DEG + 360) % 360;
  return bearing;
}

/** Smallest signed difference between two headings (degrees). */
export function headingDelta(from: number, to: number): number {
  let diff = ((to - from + 540) % 360) - 180;
  return diff;
}

/** Compass needle rotation: where Qibla sits relative to the device top edge. */
export function qiblaNeedleRotation(deviceHeading: number, qiblaBearing: number): number {
  return (qiblaBearing - deviceHeading + 360) % 360;
}

export function formatBearing(degrees: number): string {
  return `${Math.round(degrees)}°`;
}
