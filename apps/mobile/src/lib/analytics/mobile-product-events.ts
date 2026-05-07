import type { CustomerInfo } from "react-native-purchases";

import { getPremiumEntitlementId } from "../purchases/expo-extra";
import { observeProductEvent } from "../sentry/mobile";

/**
 * Lightweight, non-invasive product signals. No religious text, reflections, or drafts.
 * Wired to Sentry breadcrumbs when DSN is set; console in __DEV__ otherwise.
 */
export type ProductEventName =
  | "onboarding_completed"
  | "first_reflection_saved"
  | "paywall_shown"
  | "paywall_dismissed"
  | "paywall_rc_outcome"
  | "purchase_attempt"
  | "purchase_success"
  | "purchase_failed"
  | "restore_attempt"
  | "restore_success"
  | "restore_failed"
  | "trial_started"
  | "retention_session"
  | "quran_listen_start";

type SafeAttr = string | number | boolean;

const ATTR_KEY = /^[a-z][a-z0-9_]{0,32}$/;
const MAX_KEYS = 12;

function sanitizeAttrs(data?: Record<string, SafeAttr>): Record<string, SafeAttr> | undefined {
  if (!data) return undefined;
  const out: Record<string, SafeAttr> = {};
  let n = 0;
  for (const [k, v] of Object.entries(data)) {
    if (!ATTR_KEY.test(k) || n >= MAX_KEYS) continue;
    if (typeof v === "string") {
      out[k] = v.length > 80 ? `${v.slice(0, 80)}…` : v;
    } else out[k] = v;
    n += 1;
  }
  return Object.keys(out).length ? out : undefined;
}

export function logProductEvent(event: ProductEventName, data?: Record<string, SafeAttr>): void {
  observeProductEvent(event, sanitizeAttrs(data));
}

/** After RevenueCat identifies an active entitlement; never logs user ids. */
export function logTrialSignalsFromCustomerInfo(
  customerInfo: CustomerInfo | null,
  productIdFallback?: string | null,
): void {
  if (!customerInfo) return;
  const id = getPremiumEntitlementId();
  const e = customerInfo.entitlements.active[id];
  const ptRaw = typeof e?.periodType === "string" ? e.periodType : "";
  const trialish = ptRaw === "TRIAL" || ptRaw === "INTRO";
  const productId = (e?.productIdentifier || productIdFallback || "").slice(0, 120);
  if (trialish) {
    logProductEvent("trial_started", {
      period_type: ptRaw.slice(0, 24),
      product_id_present: Boolean(productId),
    });
  }
}
