import { NextResponse } from "next/server";

import {
  isQuranBackendReachable,
} from "@/lib/quran/config";
import {
  QuranApiMisconfiguredError,
} from "@/lib/quran/client";

export function quranDisabledResponse() {
  return NextResponse.json(
    {
      error:
        "Quran content unavailable. Enable MOCK_QURAN_API=true for scaffolding or set QURAN_CLIENT_ID and QURAN_CLIENT_SECRET on the server.",
    },
    { status: 503 },
  );
}

export function guardQuranRequest():
  | { ok: true }
  | { ok: false; response: NextResponse } {
  if (!isQuranBackendReachable()) {
    return { ok: false, response: quranDisabledResponse() };
  }
  return { ok: true };
}

export async function guardQuranOrExecute<T>(
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
    if (process.env.NODE_ENV === "development") {
      console.error("[api/quran]", e);
    }
    return NextResponse.json(
      { error: "Unable to reach Quran Foundation. Try again shortly." },
      { status: 502 },
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
