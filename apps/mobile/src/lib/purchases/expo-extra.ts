import Constants from "expo-constants";

type Extra = {
  revenueCatIosApiKey?: string;
  revenueCatPremiumEntitlement?: string;
  /** Optional public legal URLs — override for white-label bundles. */
  appTermsUrl?: string;
  appPrivacyUrl?: string;
  betaFeedbackEmail?: string;
};

export function readPurchaseExtra(): Extra {
  const ex = Constants.expoConfig?.extra as Extra | undefined;
  return typeof ex === "object" && ex ? ex : {};
}

export function getRevenueCatIosApiKey(): string {
  const fromExtra = readPurchaseExtra().revenueCatIosApiKey?.trim();
  if (fromExtra) return fromExtra;
  return typeof process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY === "string"
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY.trim()
    : "";
}

export function getPremiumEntitlementId(): string {
  const fromExtra = readPurchaseExtra().revenueCatPremiumEntitlement?.trim();
  if (fromExtra) return fromExtra;
  return typeof process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM === "string" &&
    process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM.trim()
    ? process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM.trim()
    : "premium";
}

export function getLegalTermsUrl(): string {
  const u = readPurchaseExtra().appTermsUrl?.trim();
  if (u) return u;
  return (
    process.env.EXPO_PUBLIC_APP_TERMS_URL?.trim() || "https://deennotes.ai/terms"
  );
}

export function getLegalPrivacyUrl(): string {
  const u = readPurchaseExtra().appPrivacyUrl?.trim();
  if (u) return u;
  return (
    process.env.EXPO_PUBLIC_APP_PRIVACY_URL?.trim() || "https://deennotes.ai/privacy"
  );
}

/** Destination for beta “Send feedback” mailto — optional; omit when inbox not configured yet. */
export function resolveBetaFeedbackInboxEmail(): string {
  const fromExtra = readPurchaseExtra().betaFeedbackEmail?.trim();
  if (fromExtra) return fromExtra;
  const ex =
    typeof process.env.EXPO_PUBLIC_BETA_FEEDBACK_EMAIL === "string"
      ? process.env.EXPO_PUBLIC_BETA_FEEDBACK_EMAIL.trim()
      : "";
  if (ex) return ex;
  return typeof process.env.NEXT_PUBLIC_BETA_FEEDBACK_EMAIL === "string"
    ? process.env.NEXT_PUBLIC_BETA_FEEDBACK_EMAIL.trim()
    : "";
}
