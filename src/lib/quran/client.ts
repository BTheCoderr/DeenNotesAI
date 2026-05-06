/**
 * Isolated Quran Foundation Content API client (@quranjs/api/server).
 * OAuth2 client credentials stay server-side; SDK caches tokens in memory.
 * Use {@link withQuranSdk} — not available in MOCK_QURAN_API mode.
 *
 * Docs: https://api-docs.quran.com/
 */
import "server-only";

import { createServerClient } from "@quranjs/api/server";
import type { ServerClientConfig } from "@quranjs/api";

import {
  isMockQuranMode,
  parseDefaultTranslationIds,
  resolveQuranSdkServiceUrls,
} from "./config";

export class QuranApiMisconfiguredError extends Error {
  constructor() {
    super(
      "Quran API credentials missing. Set QURAN_CLIENT_ID and QURAN_CLIENT_SECRET (server-only), or enable MOCK_QURAN_API=true for scaffolding.",
    );
    this.name = "QuranApiMisconfiguredError";
  }
}

let cachedSdk: ReturnType<typeof createServerClient> | null = null;

function buildServerSdkConfig(): ServerClientConfig {
  const clientId = process.env.QURAN_CLIENT_ID?.trim();
  const clientSecret = process.env.QURAN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new QuranApiMisconfiguredError();
  }

  const servicesRaw = resolveQuranSdkServiceUrls();
  const hasServiceOverride = Boolean(
    servicesRaw.gatewayUrl ||
      servicesRaw.oauth2BaseUrl ||
      servicesRaw.tokenHost,
  );

  const config: ServerClientConfig = {
    clientId,
    clientSecret,
    defaults: {
      translationIds: parseDefaultTranslationIds(),
    },
    ...(hasServiceOverride
      ? {
          services: {
            gatewayUrl: servicesRaw.gatewayUrl,
            oauth2BaseUrl: servicesRaw.oauth2BaseUrl,
            tokenHost: servicesRaw.tokenHost,
          },
        }
      : {}),
  };

  return config;
}

/**
 * Lazily-created SDK singleton. Throws if mocking or secrets missing.
 * Domain services must branch on mock **before** calling this.
 */
export function getQuranServerClient(): ReturnType<typeof createServerClient> {
  if (isMockQuranMode()) {
    throw new Error(
      "getQuranServerClient() must not run when MOCK_QURAN_API=true; use mock layer.",
    );
  }

  if (!cachedSdk) {
    cachedSdk = createServerClient(buildServerSdkConfig());
  }
  return cachedSdk;
}

/** Clears singleton reference and revokes cached OAuth tokens. */
export function resetQuranServerClient(): void {
  cachedSdk?.clearCachedTokens?.();
  cachedSdk = null;
}

/** Live credentials present and mock mode disabled. */
export function isLiveQuranSdkConfigured(): boolean {
  if (isMockQuranMode()) return false;
  try {
    return Boolean(
      process.env.QURAN_CLIENT_ID?.trim() &&
        process.env.QURAN_CLIENT_SECRET?.trim(),
    );
  } catch {
    return false;
  }
}

function isLikelyUnauthorized(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const maybe = err as { status?: number; message?: string };
  const status = maybe.status;
  if (status === 401) return true;
  const msg = String(maybe.message ?? err).toLowerCase();
  return msg.includes("401") || msg.includes("unauthorized");
}

/** Content API invocation with retry after token eviction on expiry. */
export async function withQuranSdk<T>(
  fn: (client: ReturnType<typeof createServerClient>) => Promise<T>,
): Promise<T> {
  if (isMockQuranMode()) {
    throw new Error("withQuranSdk called in MOCK_QURAN_API mode");
  }

  const client = getQuranServerClient();
  try {
    return await fn(client);
  } catch (e) {
    if (!isLikelyUnauthorized(e)) throw e;
    client.clearCachedTokens();
    return await fn(client);
  }
}

export function logQuranSdkError(where: string, err: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as Error).message)
      : String(err);
  console.warn(`[quran-sdk] ${where}`, msg.slice(0, 200));
}
