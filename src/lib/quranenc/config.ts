import "server-only";

function truthyEnv(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Pause outbound QuranEnc fetches (circuit breaker). */
export function isQuranEncOutboundDisabled(): boolean {
  return truthyEnv(process.env.QURANENC_DISABLED);
}

/** Use local scaffolding without calling quranenc.com (CI / demos). */
export function isMockQuranEncMode(): boolean {
  return truthyEnv(process.env.MOCK_QURANENC_API);
}

/** Public HTTP API origin (no secrets required by QuranEnc list/sura endpoints). */
export function quranEncApiOrigin(): string {
  return (
    process.env.QURANENC_API_ORIGIN?.replace(/\/$/, "").trim() ||
    "https://quranenc.com"
  );
}

/** Static CDN for translation narration MP3 assets. */
export function quranEncAudioCdnOrigin(): string {
  return (
    process.env.QURANENC_AUDIO_CDN_ORIGIN?.replace(/\/$/, "").trim() ||
    "https://d.quranenc.com"
  );
}

/**
 * QuranEnc endpoints are ordinarily public GETs. Reserve optional header injection
 * (e.g. partner keys) without ever exposing env to client bundles.
 */
export function quranEncOptionalFetchHeaders(): Record<string, string> | undefined {
  const key = process.env.QURANENC_API_KEY?.trim();
  const token = process.env.QURANENC_API_TOKEN?.trim();
  if (!key && !token) return undefined;
  const h: Record<string, string> = {};
  if (token) h.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  if (key && !token) {
    /* Common partner patterns — tune when QuranEnc documents a scheme. */
    h["X-API-Key"] = key;
  }
  return h;
}

/** Route guard: mock always works; otherwise require outbound access. */
export function isQuranEncBackendConfigured(): boolean {
  if (isMockQuranEncMode()) return true;
  if (isQuranEncOutboundDisabled()) return false;
  return Boolean(quranEncApiOrigin()?.trim());
}
