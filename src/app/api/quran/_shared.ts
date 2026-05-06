import { NextResponse } from "next/server";

import { QuranApiMisconfiguredError } from "@/lib/quran/client";
import {
  canServeQuranApiRoutes,
  safeQuranApiFailure,
  safeQuranApiSuccess,
} from "@/lib/quran/env";

export { safeQuranApiSuccess, safeQuranApiFailure };

export function quranInvalidRequest(message: string): NextResponse {
  return safeQuranApiFailure(
    { message, code: "QURAN_INVALID_INPUT", retryable: false },
    400,
  );
}

export function quranNotFoundResponse(message: string): NextResponse {
  return safeQuranApiFailure(
    { message, code: "QURAN_NOT_FOUND", retryable: false },
    404,
  );
}

export function quranDisabledResponse(): NextResponse {
  return safeQuranApiFailure(
    {
      message:
        "Quran scripture routes are paused — enable Quran Foundation credentials server-side, set MOCK_QURAN_API=true, or allow automatic graceful scaffolding (default when credentials are missing).",
      code: "QURAN_BLOCKED",
      retryable: false,
      hint:
        "On Netlify: use QURAN_CLIENT_ID / QURAN_CLIENT_SECRET (or legacy ClientID / Client_Secret), or keep graceful mock on.",
    },
    503,
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
        message:
          "Unable to reach Quran scripture services right now. Try again shortly.",
        code: "QURAN_UPSTREAM_UNAVAILABLE",
        retryable: true,
        hint: "Inspect Netlify secrets and upstream availability if this persists.",
      },
      502,
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
