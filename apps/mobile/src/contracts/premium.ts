/**
 * Monetization identifiers — match RevenueCat + App Store Connect (iOS primary).
 */

/** RevenueCat entitlement id (mirror in RevenueCat dashboard — default when env unset). */
export const REVENUECAT_PREMIUM_ENTITLEMENT_FALLBACK = "DeenNotes AI Pro";

/** App Store product identifiers. */
export const PRODUCT_MONTHLY_DEENNOTES = "deennotes.monthly";
export const PRODUCT_YEARLY_DEENNOTES = "deennotes.yearly";

/** Signed-in AI generations (compose → /api/generate-note) allowed before subscribe. */
export const FREE_AI_REFLECTION_LIMIT = 5;

export type PremiumGateReason =
  | "compose_ai_quota"
  | "khutbah_recording"
  | "offline_quran_audio"
  | "advanced_prayer_reminders"
  | "ramadan_planning"
  | "reflect_cloud_sync"
  | "general"
  | "after_onboarding"
  | "after_first_generation";

/** Modes that increment the complimentary signed-in AI quota (khutbah compose is reached only with Plus). */
export function usesComplimentaryAiQuota(modeId: string): boolean {
  return modeId !== "record_khutbah";
}

export const STORAGE_TRIGGER_PAYWALL_AFTER_ONBOARD = "deennotes.premium.trigger.after_onboard.v1";
export const STORAGE_PREMIUM_ENTITLEMENT_CACHE = "deennotes.premium.entitlement_cache.v2";
export const STORAGE_FREE_AI_USAGE = "deennotes.premium.free_ai_usage.v1";
