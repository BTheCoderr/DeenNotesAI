import { Platform } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

import { getPremiumEntitlementId } from "./expo-extra";
import { configureRevenueCatBootstrap, isPurchasesConfigured, isRevenueCatAvailable } from "./revenuecat-bootstrap";

/**
 * Outcome after attempting RevenueCat-hosted paywall (EAS/TestFlight/dev client — not Expo Go).
 *
 * `already_entitled`: `presentPaywallIfNeeded` did not show UI because required entitlement was already active.
 * `fallback_custom`: SDK unavailable, threw, or other path where we fall back to `PremiumPaywallModal`.
 */
export type RevenueCatPaywallFlowOutcome =
  | "purchased"
  | "restored"
  | "cancelled"
  | "already_entitled"
  | "error"
  | "fallback_custom";

/** Maps PAYWALL_RESULT from presentPaywallIfNeeded (NOT_PRESENTED = already entitled per RevenueCat docs). */
export function mapPaywallResultIfNeeded(r: PAYWALL_RESULT): RevenueCatPaywallFlowOutcome {
  switch (r) {
    case PAYWALL_RESULT.PURCHASED:
      return "purchased";
    case PAYWALL_RESULT.RESTORED:
      return "restored";
    case PAYWALL_RESULT.CANCELLED:
      return "cancelled";
    case PAYWALL_RESULT.NOT_PRESENTED:
      return "already_entitled";
    case PAYWALL_RESULT.ERROR:
      return "error";
    default:
      return "fallback_custom";
  }
}

/**
 * Shows RevenueCat paywall only when the configured premium entitlement is not active.
 *
 * Apple Guideline 3.1.2: the RC Paywall Editor template must visibly include Restore, Terms/Privacy URLs
 * pointing at `https://deennotesai.netlify.app/terms` and `/privacy`, and subscription billing disclosures.
 *
 * When the RevenueCat modal is skipped (SDK error / config), the app falls back to PremiumPaywallModal.
 *
 * @see https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
 */
export async function presentRevenueCatPaywallForDeenNotes(): Promise<RevenueCatPaywallFlowOutcome> {
  if (Platform.OS !== "ios" || !isRevenueCatAvailable()) {
    return "fallback_custom";
  }
  await configureRevenueCatBootstrap();
  if (!isPurchasesConfigured()) {
    return "fallback_custom";
  }
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: getPremiumEntitlementId(),
      displayCloseButton: true,
    });
    return mapPaywallResultIfNeeded(result);
  } catch {
    return "fallback_custom";
  }
}
