import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  STORAGE_FREE_AI_USAGE,
  STORAGE_PREMIUM_ENTITLEMENT_CACHE,
  STORAGE_TRIGGER_PAYWALL_AFTER_ONBOARD,
} from "../../contracts/premium";

export type PremiumCachePayload = {
  active: boolean;
  updatedAtEpochMs: number;
};

export async function readPremiumCache(): Promise<PremiumCachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREMIUM_ENTITLEMENT_CACHE);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<PremiumCachePayload>;
    if (typeof o.active !== "boolean" || typeof o.updatedAtEpochMs !== "number") return null;
    return { active: o.active, updatedAtEpochMs: o.updatedAtEpochMs };
  } catch {
    return null;
  }
}

export async function writePremiumCache(next: PremiumCachePayload): Promise<void> {
  await AsyncStorage.setItem(STORAGE_PREMIUM_ENTITLEMENT_CACHE, JSON.stringify(next));
}

export async function clearPremiumCache(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_PREMIUM_ENTITLEMENT_CACHE);
}

export async function readFreeAiGenerationCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_FREE_AI_USAGE);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function incrementFreeAiGenerationCount(): Promise<number> {
  const cur = await readFreeAiGenerationCount();
  const next = cur + 1;
  await AsyncStorage.setItem(STORAGE_FREE_AI_USAGE, String(next));
  return next;
}

/** Mark that we should softly prompt DeenNotes Plus shortly after onboarding. */
export async function setPaywallTriggerAfterOnboarding(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_TRIGGER_PAYWALL_AFTER_ONBOARD, "1");
}

export async function consumePaywallTriggerAfterOnboarding(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_TRIGGER_PAYWALL_AFTER_ONBOARD);
  if (raw !== "1") return false;
  await AsyncStorage.removeItem(STORAGE_TRIGGER_PAYWALL_AFTER_ONBOARD);
  return true;
}
