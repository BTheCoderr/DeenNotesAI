/**
 * Quran Foundation runtime env — validates configuration, merges API envelopes,
 * and enables Netlify-safe graceful mock when OAuth secrets are absent.
 */

import "server-only";

import { NextResponse } from "next/server";

import type {
  QuranPublicApiMeta,
  QuranPublicErrorBody,
  QuranPublicErrorCode,
  QuranServingMode,
} from "./api-contract";

export type QuranEnvIssueSeverity = "info" | "warn" | "error";

export type QuranEnvIssue = {
  code: string;
  severity: QuranEnvIssueSeverity;
  /** Safe for logs — generic guidance only */
  hint: string;
};

export type QuranEnvironmentReport = {
  mode: QuranServingMode;
  canServe: boolean;
  /** True while using mock scaffolding (explicit or graceful). */
  usesOfflineDataset: boolean;
  mockExplicit: boolean;
  liveCredentialsPresent: boolean;
  gracefulFallbackEnabled: boolean;
  issues: QuranEnvIssue[];
};

const BOOT_LOG_KEY =
  "__deennotes_quran_env_logged_v1__" as const;

function globalBootFlag(): Record<string, boolean> {
  return globalThis as unknown as Record<string, boolean>;
}

/**
 * Preferred names (`QURAN_CLIENT_*`). Netlify/UI often uses shorter keys — honor those too.
 * Linux runners treat env keys case-sensitively; match what you typed in the dashboard exactly.
 *
 * Order: canonical first, then common aliases seen in dashboards / local `.env`.
 */
const QURAN_CLIENT_ID_KEYS = [
  "QURAN_CLIENT_ID",
  "Client_ID",
  "ClientID",
  "CLIENT_ID",
] as const;

const QURAN_CLIENT_SECRET_KEYS = [
  "QURAN_CLIENT_SECRET",
  "Client_Secret",
  "CLIENT_SECRET",
] as const;

function firstTruthyEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const v = process.env[key];
    const t = typeof v === "string" ? v.trim() : "";
    if (t.length > 0) return t;
  }
  return undefined;
}

/** Effective Quran Foundation OAuth client id (server-only). */
export function resolveQuranClientId(): string | undefined {
  return firstTruthyEnv(QURAN_CLIENT_ID_KEYS);
}

/** Effective Quran Foundation OAuth client secret (server-only). */
export function resolveQuranClientSecret(): string | undefined {
  return firstTruthyEnv(QURAN_CLIENT_SECRET_KEYS);
}

/** MOCK_QURAN_API — explicit scaffolding (OAuth not required). */
export function isMockQuranMode(): boolean {
  const m = process.env.MOCK_QURAN_API?.trim().toLowerCase();
  return m === "true" || m === "1" || m === "yes";
}

export function isLiveQuranCredentialsConfigured(): boolean {
  return Boolean(
    resolveQuranClientId() && resolveQuranClientSecret(),
  );
}

/**
 * Netlify deployments without Quran Foundation OAuth may still ship a calm reader UI.
 * Explicit `QURAN_GRACEFUL_MOCK_FALLBACK=false|0|no` hard-stops Quran routes instead.
 *
 * Defaults to **on** whenever live credentials are missing (excluding explicit mock mode).
 */
export function readGracefulMockFallbackEnv(): boolean {
  const raw = process.env.QURAN_GRACEFUL_MOCK_FALLBACK?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  return true;
}

export function isGracefulMockFallbackEffective(): boolean {
  if (isMockQuranMode()) return false;
  if (isLiveQuranCredentialsConfigured()) return false;
  return readGracefulMockFallbackEnv();
}

/**
 * When OAuth is absent, `/api/quran/*` can still call public Quran.com REST v4 from the server.
 * Set `QURAN_DISABLE_PUBLIC_HTTP_BRIDGE=true` to turn this off (routes then follow mock/blocked rules only).
 */
export function isQuranPublicHttpBridgeEnabled(): boolean {
  const raw = process.env.QURAN_DISABLE_PUBLIC_HTTP_BRIDGE?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return false;
  return true;
}

/**
 * Offline / scaffolding dataset handlers — mock helpers *before* OAuth SDK paths.
 */
export function usesOfflineQuranDataset(): boolean {
  if (isMockQuranMode()) return true;
  return isGracefulMockFallbackEffective();
}

/** Quran App Router endpoints may respond (live OAuth, scaffolding, or public Quran.com v4). */
export function canServeQuranApiRoutes(): boolean {
  return (
    usesOfflineQuranDataset() ||
    isLiveQuranCredentialsConfigured() ||
    isQuranPublicHttpBridgeEnabled()
  );
}

export function getQuranServingMode(): QuranServingMode {
  if (isMockQuranMode()) return "mock_explicit";
  if (isLiveQuranCredentialsConfigured()) return "live";
  if (isQuranPublicHttpBridgeEnabled()) return "public_http";
  if (isGracefulMockFallbackEffective()) return "mock_fallback";
  return "blocked";
}

function buildIssues(report: Omit<QuranEnvironmentReport, "issues">): QuranEnvIssue[] {
  const issues: QuranEnvIssue[] = [];
  if (report.mockExplicit) {
    issues.push({
      code: "mock_explicit_enabled",
      severity: "info",
      hint: "MOCK_QURAN_API scaffold active — Quran Foundation OAuth not invoked.",
    });
  }
  if (report.liveCredentialsPresent && !report.mockExplicit) {
    issues.push({
      code: "live_credentials_present",
      severity: "info",
      hint: "Quran Foundation OAuth id + secret detected via QURAN_CLIENT_* or legacy ClientID / Client_Secret (values never logged).",
    });
  }
  if (report.mode === "mock_fallback") {
    issues.push({
      code: "graceful_mock_fallback",
      severity: "warn",
      hint: "Serving scaffold ayāt because Quran Foundation credentials are absent. Set OAuth secrets or MOCK_QURAN_API=true deliberately.",
    });
  }
  if (report.mode === "public_http") {
    issues.push({
      code: "public_quran_dotcom_bridge",
      severity: "info",
      hint: "Serving Qur’an via public api.quran.com v4 (no OAuth). Optional: QURAN_PUBLIC_TRANSLATION_ID, QURAN_DEFAULT_RECITER_ID.",
    });
  }
  if (report.mode === "blocked") {
    issues.push({
      code: "quran_blocked",
      severity: "error",
      hint: "Quran routes paused: credentials missing and QURAN_GRACEFUL_MOCK_FALLBACK disabled.",
    });
  }
  if (!report.liveCredentialsPresent && report.mode !== "mock_explicit") {
    issues.push({
      code: "missing_quran_oauth_credentials",
      severity:
        report.mode === "blocked" ? "error" : "warn",
      hint: "Set QURAN_CLIENT_ID / QURAN_CLIENT_SECRET (or ClientID / Client_Secret) server-side when ready for live Quran.com Content API.",
    });
  }
  return issues;
}

function maybeLogQuranEnvReport(report: QuranEnvironmentReport): void {
  const g = globalBootFlag();
  if (g[BOOT_LOG_KEY]) return;
  const shouldLog =
    report.mode === "blocked" ||
    report.mode === "mock_fallback" ||
    report.mode === "public_http" ||
    (process.env.NEXT_PUBLIC_DEBUG_ENV === "true" &&
      process.env.NODE_ENV !== "production");
  if (!shouldLog) return;
  g[BOOT_LOG_KEY] = true;

  const payload = {
    tag: "deennotes.quran.env",
    mode: report.mode,
    canServe: report.canServe,
    usesOfflineDataset: report.usesOfflineDataset,
    netlify: Boolean(process.env.NETLIFY || process.env.NETLIFY_DEV),
    hasQuranClientId: Boolean(resolveQuranClientId()),
    hasQuranClientSecret: Boolean(resolveQuranClientSecret()),
    mockExplicit: report.mockExplicit,
    gracefulFallbackEnv: readGracefulMockFallbackEnv(),
    issueCodes: report.issues.map((i) => i.code),
  };
  console.warn(JSON.stringify(payload));
}

/**
 * Runtime validation for operators / health checks — never logs secret values.
 */
export function validateQuranEnvironment(): QuranEnvironmentReport {
  const mockExplicit = isMockQuranMode();
  const liveCredentialsPresent = isLiveQuranCredentialsConfigured();
  const gracefulFallbackEnabled = readGracefulMockFallbackEnv();
  const mode = getQuranServingMode();
  const usesOfflineDataset = usesOfflineQuranDataset();
  const canServe = canServeQuranApiRoutes();

  const base: Omit<QuranEnvironmentReport, "issues"> = {
    mode,
    canServe,
    usesOfflineDataset,
    mockExplicit,
    liveCredentialsPresent,
    gracefulFallbackEnabled,
  };
  const issues = buildIssues(base);
  const report: QuranEnvironmentReport = { ...base, issues };
  maybeLogQuranEnvReport(report);
  return report;
}

export function snapshotQuranPublicMeta(): QuranPublicApiMeta {
  const mode = getQuranServingMode();
  return {
    servingMode: mode,
    offlineReflectionDataset:
      mode === "mock_explicit" || mode === "mock_fallback",
  };
}

export function safeQuranApiSuccess(
  body: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse {
  return NextResponse.json(
    { ...body, _quran: snapshotQuranPublicMeta() },
    init,
  );
}

export function safeQuranApiResponse(
  body: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse {
  return safeQuranApiSuccess(body, init);
}

type FailureInput = {
  message: string;
  code: QuranPublicErrorCode;
  retryable: boolean;
  hint?: string;
};

export function safeQuranApiFailure(
  input: FailureInput,
  status: number,
  init?: ResponseInit,
): NextResponse {
  const payload: QuranPublicErrorBody = {
    error: input.message,
    code: input.code,
    retryable: input.retryable,
    hint: input.hint,
    _quran: snapshotQuranPublicMeta(),
  };
  return NextResponse.json(payload, {
    ...init,
    status,
    headers: mergeHeaders(init?.headers, {
      "X-Quran-Error": input.code,
    }),
  });
}

function mergeHeaders(
  a: HeadersInit | undefined,
  b: Record<string, string>,
): Headers {
  const h = new Headers(a ?? undefined);
  for (const [k, v] of Object.entries(b)) {
    h.set(k, v);
  }
  return h;
}
