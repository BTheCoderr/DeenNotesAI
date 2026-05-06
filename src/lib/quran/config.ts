import "server-only";

import {
  canServeQuranApiRoutes,
  getQuranServingMode,
  isGracefulMockFallbackEffective,
  isLiveQuranCredentialsConfigured,
  isMockQuranMode,
  resolveQuranClientId,
  resolveQuranClientSecret,
  usesOfflineQuranDataset,
  validateQuranEnvironment,
} from "./env";

/**
 * Quran Foundation / Quran.com Content API runtime configuration (server-only).
 * Auth URLs are environment-driven: production relies on SDK defaults unless overridden;
 * prelive/staging merges explicit overrides so Netlify/Vercel preview can pin gateways.
 */

export type QfEnvKind = "production" | "prelive" | "staging";

export {
  canServeQuranApiRoutes,
  getQuranServingMode,
  isGracefulMockFallbackEffective,
  isLiveQuranCredentialsConfigured,
  isMockQuranMode,
  resolveQuranClientId,
  resolveQuranClientSecret,
  usesOfflineQuranDataset,
  validateQuranEnvironment,
};

/** @deprecated Prefer {@link canServeQuranApiRoutes} — retained for incremental refactors */
export function isQuranBackendReachable(): boolean {
  return canServeQuranApiRoutes();
}

/** Normalizes `QF_ENV`: production | prelive | staging (aliases). */
export function readQfEnv(): QfEnvKind {
  const raw = process.env.QF_ENV?.trim().toLowerCase();
  if (raw === "prelive" || raw === "preview") return "prelive";
  if (raw === "staging" || raw === "stage" || raw === "development") {
    return "staging";
  }
  return "production";
}

/** Optional SDK `services` overrides. Undefined keys keep @quranjs/api defaults. */
export function resolveQuranSdkServiceUrls(): {
  gatewayUrl?: string;
  oauth2BaseUrl?: string;
  tokenHost?: string;
} {
  const env = readQfEnv();

  /* Explicit env wins for every tier (recommended for Netlify preview / prelive). */
  const fromEnv = {
    gatewayUrl: process.env.QURAN_GATEWAY_URL?.trim() || undefined,
    oauth2BaseUrl: process.env.QURAN_OAUTH_BASE_URL?.trim() || undefined,
    tokenHost: process.env.QURAN_TOKEN_HOST?.trim() || undefined,
  };

  if (env === "production") {
    return fromEnv;
  }

  /* Non-production: allow env-only pins; do not hardcode undocumented hosts. */
  return fromEnv;
}

export function parseDefaultTranslationIds(): (string | number)[] {
  const raw = process.env.QURAN_DEFAULT_TRANSLATION_IDS?.trim();
  if (!raw) return [131];
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const n = Number(s);
      return Number.isFinite(n) ? n : s;
    });
}

export function parseDefaultTafsirIds(): (string | number)[] | undefined {
  const raw = process.env.QURAN_DEFAULT_TAFSIR_IDS?.trim();
  if (!raw) return undefined;
  const ids = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const n = Number(s);
      return Number.isFinite(n) ? n : s;
    });
  return ids.length ? ids : undefined;
}

export function defaultVerseReciterId(): string {
  return process.env.QURAN_DEFAULT_RECITER_ID?.trim() || "7";
}
