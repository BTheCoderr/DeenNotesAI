/**
 * Central map: what Plus unlocks vs the always-free core (Quran read, basic prayer, etc.).
 * Derived only from RevenueCat-style entitlement — same rule as existing `!purchasesAvailable || isPremium`.
 */
export type PremiumFeatureFlags = {
  /** True when Plus is active, or IAP unavailable (dev / simulator). */
  hasPlusEntitlement: boolean;
  canUseUnlimitedAI: boolean;
  canSaveRecordings: boolean;
  canUseAdvancedPrayerReminders: boolean;
  canUsePremiumQuranReflections: boolean;
  canUseReflectionMemory: boolean;
  canUseOfflineQuranAudio: boolean;
  /** Online playback remains available to everyone; offline bundles stay gated elsewhere. */
  canUseBackgroundQuranListening: boolean;
  canUseRamadanPlannerSurfaces: boolean;
  /** Widgets are not paywalled today; reserved for future tuning. */
  canUseWidgetPersonalization: boolean;
};

export function derivePremiumFeatureFlags(input: {
  isPremium: boolean;
  purchasesAvailable: boolean;
}): PremiumFeatureFlags {
  const hasPlusEntitlement = !input.purchasesAvailable || input.isPremium;

  return {
    hasPlusEntitlement,
    canUseUnlimitedAI: hasPlusEntitlement,
    canSaveRecordings: hasPlusEntitlement,
    canUseAdvancedPrayerReminders: hasPlusEntitlement,
    canUsePremiumQuranReflections: hasPlusEntitlement,
    canUseReflectionMemory: hasPlusEntitlement,
    canUseOfflineQuranAudio: hasPlusEntitlement,
    canUseBackgroundQuranListening: true,
    canUseRamadanPlannerSurfaces: hasPlusEntitlement,
    canUseWidgetPersonalization: true,
  };
}

/** Calm copy when a surface needs Plus — use instead of empty errors. */
export const COPY_CALM_UPGRADE_HINT =
  "DeenNotes Plus keeps this gentle rhythm uninterrupted — upgrade when you’re ready.";
