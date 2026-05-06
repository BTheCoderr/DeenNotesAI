import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

let initialized = false;

const SENSITIVE_EXTRA_KEY =
  /^(body|draft|text|ayah|arabic|translation|quran|note|prompt|recording|reflection|content|message|input)$/i;

function sanitizeExtraValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.length > 160 ? `[omitted len=${value.length}]` : value;
  }
  if (value && typeof value === "object") {
    try {
      const s = JSON.stringify(value);
      return s.length > 200 ? `[omitted object len=${s.length}]` : value;
    } catch {
      return "[omitted]";
    }
  }
  return value;
}

function sanitizeExtras(extra?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!extra) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(extra)) {
    if (SENSITIVE_EXTRA_KEY.test(k)) continue;
    out[k] = sanitizeExtraValue(v);
  }
  return Object.keys(out).length ? out : undefined;
}

function resolveDsn(): string | undefined {
  const env = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (env) return env;
  const extra = Constants.expoConfig?.extra as { sentryDsn?: string } | undefined;
  const ex = typeof extra?.sentryDsn === "string" ? extra.sentryDsn.trim() : "";
  return ex || undefined;
}

/** Call once near app root — no-op until DSN is configured (silent in production without DSN). */
export function initMobileMonitoring(): void {
  if (initialized) return;
  initialized = true;

  const dsn = resolveDsn();
  Sentry.init({
    dsn: dsn ?? undefined,
    enabled: Boolean(dsn),
    tracesSampleRate: __DEV__ ? 0 : 0.06,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((b) =>
          b.message && b.message.length > 200 ? { ...b, message: `${b.message!.slice(0, 200)}…` } : b,
        );
      }
      return event;
    },
  });
}

export function captureAppIssue(scope: string, err: unknown, extra?: Record<string, unknown>): void {
  const dsn = resolveDsn();
  if (!dsn) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DeenNotes:${scope}] Monitoring disabled — no EXPO_PUBLIC_SENTRY_DSN`, err, extra);
    }
    return;
  }
  const e =
    err instanceof Error
      ? err
      : new Error(typeof err === "string" ? err.slice(0, 280) : "[non-error]");
  const safeExtra = sanitizeExtras(extra);
  Sentry.withScope((s) => {
    s.setTag("scope", scope);
    if (safeExtra) {
      for (const [k, v] of Object.entries(safeExtra)) s.setExtra(k, v as never);
    }
    Sentry.captureException(e);
  });
}

export function captureAppMessage(
  scope: string,
  message: string,
  level: "fatal" | "error" | "warning" | "log" | "info" | "debug" = "warning",
): void {
  const dsn = resolveDsn();
  if (!dsn) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DeenNotes:${scope}] Monitoring disabled — no EXPO_PUBLIC_SENTRY_DSN`, message, level);
    }
    return;
  }
  const safeMsg = message.length > 220 ? `${message.slice(0, 220)}…` : message;
  Sentry.withScope((s) => {
    s.setTag("scope", scope);
    Sentry.captureMessage(`${scope}: ${safeMsg}`, level);
  });
}
