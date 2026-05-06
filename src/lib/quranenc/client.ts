import "server-only";

import {
  quranEncApiOrigin,
  quranEncOptionalFetchHeaders,
  isMockQuranEncMode,
} from "./config";

const UA =
  process.env.QURANENC_HTTP_USER_AGENT?.trim() ??
  "DeenNotesAI QuranEnc Integration";

/** Defensive normalization */
export function assertSafeTranslationKey(key: string): string {
  const k = key.trim().toLowerCase();
  if (!/^[a-z0-9_]{2,64}$/.test(k)) {
    throw new QuranEncTranslationKeyError(key);
  }
  return k;
}

export class QuranEncTranslationKeyError extends Error {
  constructor(key: string) {
    super(`Invalid QuranEnc translation key: ${key}`);
    this.name = "QuranEncTranslationKeyError";
  }
}

/** Outbound fetch error — surfaced as 502 to clients without leaking internals */
export class QuranEncFetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "QuranEncFetchError";
  }
}

/** HTTP GET JSON from QuranEnc public Content API — server-only path construction */
export async function fetchQuranEncJson<T>(
  pathname: string,
  init?: RequestInit & { next?: { revalidate?: number | false | 0 | 60 } },
): Promise<T> {
  if (isMockQuranEncMode()) {
    throw new Error("fetchQuranEncJson invoked while MOCK_QURANENC_API=true");
  }

  const base = quranEncApiOrigin();
  const url =
    pathname.startsWith("http") ? pathname : `${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`;

  const extra = quranEncOptionalFetchHeaders();
  const headers: HeadersInit = {
    Accept: "application/json",
    "User-Agent": UA,
    ...extra,
    ...(init?.headers ?? {}),
  };

  const res = await fetch(url, {
    ...init,
    method: init?.method ?? "GET",
    headers,
    /* CDN-friendly ISR at route layer — callers set cache if needed */
    cache: init?.cache ?? "default",
    next: init?.next,
  });

  if (!res.ok) {
    throw new QuranEncFetchError(`QuranEnc HTTP ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}

export function logQuranEncWarning(where: string, err: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as Error).message)
      : String(err);
  console.warn(`[quranenc] ${where}`, msg.slice(0, 220));
}
