/** Shared Quran API JSON shape — safe to import from Client Components (no secrets). */

export type QuranServingMode =
  | "live"
  | "mock_explicit"
  | "mock_fallback"
  /** Routes would 503 until MOCK_QURAN_API or credentials or graceful mock is enabled. */
  | "blocked";

export type QuranPublicApiMeta = {
  servingMode: QuranServingMode;
  /** Scaffold / graceful-offline Qur’an dataset — not manuscript text for QA. */
  offlineReflectionDataset: boolean;
};

export type QuranPublicErrorBody = {
  error: string;
  code?: QuranPublicErrorCode;
  retryable?: boolean;
  /** Generic operator hint — never includes secrets or raw tokens. */
  hint?: string;
  _quran?: QuranPublicApiMeta;
};

/** Machine-readable subset for clients and dashboards. */
export type QuranPublicErrorCode =
  | "QURAN_BLOCKED"
  | "QURAN_UPSTREAM_UNAVAILABLE"
  | "QURAN_NETWORK"
  /** Request validation failures (still typed for analytics). */
  | "QURAN_INVALID_INPUT"
  /** Resource missing (wrong surah bounds, etc.). */
  | "QURAN_NOT_FOUND";

export type SplitQuranJsonResult<T> = {
  data: T;
  meta: QuranPublicApiMeta | null;
};

/**
 * Removes `_quran` service envelope from `/api/quran/*` payloads for typed consumers.
 */
export function splitQuranApiJson<T extends Record<string, unknown>>(
  raw: unknown,
): SplitQuranJsonResult<T> {
  if (!raw || typeof raw !== "object") {
    return { data: {} as T, meta: null };
  }
  const o = raw as Record<string, unknown>;
  const metaRaw = o._quran;
  const meta =
    metaRaw &&
    typeof metaRaw === "object" &&
    typeof (metaRaw as QuranPublicApiMeta).servingMode === "string"
      ? (metaRaw as QuranPublicApiMeta)
      : null;

  const { _quran: _drop, ...rest } = o;
  void _drop;
  return { data: rest as T, meta };
}

export function offlineReflectionSubtitle(meta: QuranPublicApiMeta | null): string | null {
  if (!meta?.offlineReflectionDataset) return null;
  return "You’re in offline reflection mode — scaffolding text only, not Qur’anic manuscript. Add Quran Foundation credentials to load live scripture.";
}

/** Normalizes Quran API error payloads (no throw). */
export function parseQuranErrorPayload(raw: unknown): {
  message: string;
  code?: QuranPublicErrorCode;
  retryable?: boolean;
  hint?: string;
  meta: QuranPublicApiMeta | null;
} {
  if (!raw || typeof raw !== "object") {
    return { message: "Something interrupted this request.", meta: null };
  }
  const o = raw as Record<string, unknown>;
  const err = typeof o.error === "string" ? o.error : "Request failed.";
  const code =
    typeof o.code === "string" ? (o.code as QuranPublicErrorCode) : undefined;
  const retryable =
    typeof o.retryable === "boolean" ? o.retryable : undefined;
  const hint =
    typeof o.hint === "string" ? o.hint : undefined;
  const metaRaw = o._quran;
  const meta =
    metaRaw &&
    typeof metaRaw === "object" &&
    typeof (metaRaw as QuranPublicApiMeta).servingMode === "string"
      ? (metaRaw as QuranPublicApiMeta)
      : null;

  return { message: err, code, retryable, hint, meta };
}
