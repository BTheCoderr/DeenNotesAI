import { NextResponse } from "next/server";

import {
  isMockQuranEncMode,
  isQuranEncOutboundDisabled,
  isQuranEncBackendConfigured,
} from "@/lib/quranenc/config";
import {
  QuranEncFetchError,
  QuranEncTranslationKeyError,
} from "@/lib/quranenc/client";

export function quranEncUnavailableResponse(message?: string) {
  return NextResponse.json(
    {
      error:
        message ??
        "QuranEnc integration disabled. Override QURANENC_DISABLED or enable MOCK_QURANENC_API for scaffolding.",
    },
    { status: 503 },
  );
}

type GuardOk = { ok: true } | { ok: false; response: NextResponse };

export function guardQuranEncRequest(): GuardOk {
  if (!isQuranEncBackendConfigured()) {
    return { ok: false, response: quranEncUnavailableResponse() };
  }
  if (isQuranEncOutboundDisabled() && !isMockQuranEncMode()) {
    return {
      ok: false,
      response: quranEncUnavailableResponse(
        "Server operator disabled QuranEnc outbound calls (QURANENC_DISABLED). Enable mock or unset the breaker.",
      ),
    };
  }
  return { ok: true };
}

export async function guardQuranEncOrExecute<T>(
  fn: () => Promise<T>,
): Promise<NextResponse | T> {
  const g = guardQuranEncRequest();
  if (!g.ok) return g.response;

  try {
    return await fn();
  } catch (e) {
    if (e instanceof QuranEncTranslationKeyError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    if (e instanceof QuranEncFetchError && e.status === 404) {
      return NextResponse.json(
        { error: "Translation or sura unavailable from QuranEnc." },
        { status: 404 },
      );
    }
    if (e instanceof QuranEncFetchError) {
      return NextResponse.json({ error: "Upstream QuranEnc unreachable." }, { status: 502 });
    }
    if (process.env.NODE_ENV === "development") {
      console.error("[api/quranenc]", e);
    }
    return NextResponse.json({ error: "QuranEnc request failed." }, { status: 502 });
  }
}
