import { NextResponse } from "next/server";

import type { QuranMobileRouteCacheMode } from "@/lib/quran/quranDotComPublicFetch";
import { quranMobilePublicRouteHeaders } from "@/lib/quran/quranDotComPublicFetch";
import { QuranApiMisconfiguredError } from "@/lib/quran/client";
import {
  canServeQuranApiRoutes,
  safeQuranApiFailure,
  safeQuranApiSuccess,
} from "@/lib/quran/env";

export { safeQuranApiSuccess, safeQuranApiFailure };

/** Merge CORS/cache headers safe for Expo with optional route-specific overrides. */
export function mergeQuranMobileHeaders(
  corsMode: QuranMobileRouteCacheMode,
  extra?: HeadersInit,
): Headers {
  const h = new Headers(quranMobilePublicRouteHeaders(corsMode));
  if (extra) {
    const e = new Headers(extra);
    e.forEach((v, k) => h.set(k, v));
  }
  return h;
}

export function quranInvalidRequest(message: string): NextResponse {
  return safeQuranApiFailure(
    { message, code: "QURAN_INVALID_INPUT", retryable: false },
    400,
    { headers: mergeQuranMobileHeaders("none") },
  );
}

export function quranNotFoundResponse(message: string): NextResponse {
  return safeQuranApiFailure(
    { message, code: "QURAN_NOT_FOUND", retryable: false },
    404,
    { headers: mergeQuranMobileHeaders("none") },
  );
}

export function quranDisabledResponse(): NextResponse {
  return safeQuranApiFailure(
    {
      message:
        "The Qur’an reader isn’t enabled for this site right now.",
      code: "QURAN_BLOCKED",
      retryable: false,
      hint:
        "Operators: unset QURAN_DISABLE_PUBLIC_HTTP_BRIDGE, add Quran Foundation OAuth (QURAN_CLIENT_ID / QURAN_CLIENT_SECRET), set MOCK_QURAN_API=true, or enable QURAN_GRACEFUL_MOCK_FALLBACK.",
    },
    503,
    { headers: mergeQuranMobileHeaders("none") },
  );
}

export function guardQuranRequest():
  | { ok: true }
  | { ok: false; response: NextResponse } {
  if (!canServeQuranApiRoutes()) {
    return { ok: false, response: quranDisabledResponse() };
  }
  return { ok: true };
}

export async function guardQuranOrExecute<T extends NextResponse | unknown>(
  fn: () => Promise<T>,
): Promise<NextResponse | T> {
  const g = guardQuranRequest();
  if (!g.ok) return g.response;

  try {
    return await fn();
  } catch (e) {
    if (e instanceof QuranApiMisconfiguredError) {
      return quranDisabledResponse();
    }
    const structured =
      e && typeof e === "object" && "message" in e
        ? String((e as Error).message)
        : String(e);

    console.warn(
      JSON.stringify({
        tag: "deennotes.quran.api",
        where: "guardQuranOrExecute",
        phase: "upstream",
        detail: structured.slice(0, 420),
      }),
    );

    return safeQuranApiFailure(
      {
        message: "Scripture services are unreachable right now. Please try again shortly.",
        code: "QURAN_UPSTREAM_UNAVAILABLE",
        retryable: true,
        hint:
          "Check Netlify function logs, Quran Foundation status, OAuth env scopes, and gateway overrides (QURAN_GATEWAY_URL / QURAN_OAUTH_BASE_URL).",
      },
      502,
      { headers: mergeQuranMobileHeaders("none") },
    );
  }
}

/** Comma/whitespace-separated resource ids for verses queries. */
export function parseQueryIdList(
  raw: string | null,
): (string | number)[] | undefined {
  if (!raw?.trim()) return undefined;
  const parts = raw.split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return undefined;
  return parts.map((p) => {
    const n = Number(p);
    return Number.isFinite(n) ? n : p;
  });
}
