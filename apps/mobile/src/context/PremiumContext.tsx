import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import type { CustomerInfo } from "react-native-purchases";

import Purchases from "react-native-purchases";

import type { PremiumGateReason } from "../contracts/premium";
import { FREE_AI_REFLECTION_LIMIT, usesComplimentaryAiQuota } from "../contracts/premium";
import { useMobileSession } from "../hooks/useMobileSession";
import {
  configureRevenueCatBootstrap,
  fetchCustomerInfoSafe,
  isPurchasesConfigured,
  isRevenueCatAvailable,
  loginRevenueCatWithUserId,
  logoutRevenueCatIfConfigured,
  premiumActiveFromCustomerInfo,
  restorePurchasesNative,
} from "../lib/purchases/revenuecat-bootstrap";
import {
  consumePaywallTriggerAfterOnboarding,
  clearPremiumCache,
  incrementFreeAiGenerationCount,
  readFreeAiGenerationCount,
  readPremiumCache,
  writePremiumCache,
} from "../lib/purchases/premium-storage";
import { presentRevenueCatPaywallForDeenNotes } from "../lib/purchases/revenuecat-paywall-present";

import { logProductEvent } from "../lib/analytics/mobile-product-events";
import type { PaywallOutcome } from "../components/paywall/PremiumPaywallModal";
import { PremiumPaywallModal } from "../components/paywall/PremiumPaywallModal";

export type PremiumContextValue = {
  /** True when entitled for DeenNotes Plus (RevenueCat entitlement). */
  isPremium: boolean;
  /** First-time SDK + cache handshake complete (or skipped on unsupported platforms). */
  isHydrated: boolean;
  /**
   * True while RevenueCat entitlement is unresolved on a purchases-capable iOS build.
   * Cached `isPremium` may already be applied to reduce UI flicker.
   */
  loading: boolean;
  /** Purchases SDK is linked and an iOS API key is present. */
  purchasesAvailable: boolean;
  /** Free AI generations already completed (local counter). */
  freeAiGenerationsUsed: number;
  openPaywall: (reason?: PremiumGateReason) => void;
  closePaywall: () => void;
  refreshEntitlements: () => Promise<void>;
  /** Alias for `refreshEntitlements` — sync entitlements after purchase/restore/session change. */
  refreshPremiumStatus: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  /** Before calling /api/generate-note for signed-in users. */
  assertAiGenerationAllowed: () => Promise<boolean>;
  /** Call after a successful `/api/generate-note` completion (skipped for khutbah / when not on a paid-capable store build). */
  recordSuccessfulAiGeneration: (composeModeId: string | null) => Promise<number>;
  /** Premium-only features (khutbah, offline audio prep, etc.). */
  assertPremiumOrPaywall: (reason: PremiumGateReason) => boolean;
};

const PremiumCtx = createContext<PremiumContextValue | null>(null);

function useApplyCustomerInfo(
  setPremium: (v: boolean) => void,
  setHydrated: (v: boolean) => void,
) {
  return useCallback(
    async (fromNetwork: boolean) => {
      const info = await fetchCustomerInfoSafe();
      const active = premiumActiveFromCustomerInfo(info);
      setPremium(active);
      if (info) {
        await writePremiumCache({ active, updatedAtEpochMs: Date.now() });
      }
      if (fromNetwork) setHydrated(true);
    },
    [setPremium, setHydrated],
  );
}

function RevenueCatIdentityBridge({
  children,
  onLogoutReset,
}: PropsWithChildren<{ onLogoutReset: () => void }>) {
  const auth = useMobileSession();
  const authLaneRef = useRef<string | "__uninitialized__">("__uninitialized__");
  const hadAuthenticatedUserRef = useRef(false);

  useEffect(() => {
    if (!isRevenueCatAvailable()) return;
    if (!auth.ready) return;
    const lane = auth.session?.user?.id ?? "";
    if (authLaneRef.current === lane) return;
    authLaneRef.current = lane;
    void (async () => {
      await configureRevenueCatBootstrap();
      if (lane) {
        hadAuthenticatedUserRef.current = true;
        await loginRevenueCatWithUserId(lane);
      } else {
        await logoutRevenueCatIfConfigured();
        if (hadAuthenticatedUserRef.current) {
          hadAuthenticatedUserRef.current = false;
          onLogoutReset();
        }
      }
    })();
  }, [auth.ready, auth.session?.user?.id, onLogoutReset]);

  return children;
}

export function PremiumProvider({ children }: PropsWithChildren) {
  const [isPremium, setIsPremium] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PremiumGateReason | null>(null);

  const applyCustomerInfo = useApplyCustomerInfo(setIsPremium, setIsHydrated);

  const onLogoutReset = useCallback(() => {
    setIsPremium(false);
    void clearPremiumCache();
  }, []);

  const refreshEntitlements = useCallback(async () => {
    if (!isRevenueCatAvailable()) {
      setIsHydrated(true);
      return;
    }
    await configureRevenueCatBootstrap();
    await applyCustomerInfo(true);
  }, [applyCustomerInfo]);

  const openPaywall = useCallback(
    (reason: PremiumGateReason = "general") => {
      logProductEvent("paywall_shown", { reason });
      setPaywallReason(reason);
      setPaywallOpen(false);

      void (async () => {
        const outcome = await presentRevenueCatPaywallForDeenNotes();
        await refreshEntitlements();

        const closeRcFlow = outcome === "purchased"
          || outcome === "restored"
          || outcome === "cancelled"
          || outcome === "already_entitled";

        if (closeRcFlow) {
          logProductEvent("paywall_rc_outcome", { reason, outcome });
          setPaywallOpen(false);
          setPaywallReason(null);
          return;
        }

        logProductEvent("paywall_rc_outcome", {
          reason,
          outcome: outcome === "error" ? "error" : "fallback_custom",
        });
        setPaywallOpen(true);
      })();
    },
    [refreshEntitlements],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [cache, used] = await Promise.all([readPremiumCache(), readFreeAiGenerationCount()]);
      if (cancelled) return;
      if (cache) setIsPremium(cache.active);
      setFreeUsed(used);
      await refreshEntitlements();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshEntitlements]);

  useEffect(() => {
    if (!isRevenueCatAvailable()) return;
    void configureRevenueCatBootstrap();
    const handler = (info: CustomerInfo) => {
      const active = premiumActiveFromCustomerInfo(info);
      setIsPremium(active);
      void writePremiumCache({ active, updatedAtEpochMs: Date.now() });
    };
    Purchases.addCustomerInfoUpdateListener(handler);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(handler);
    };
  }, []);

  useEffect(() => {
    if (!isRevenueCatAvailable()) return;
    const sub = (s: AppStateStatus) => {
      if (s === "active") void refreshEntitlements();
    };
    const ac = AppState.addEventListener("change", sub);
    return () => ac.remove();
  }, [refreshEntitlements]);

  useEffect(() => {
    if (!isHydrated) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void consumePaywallTriggerAfterOnboarding().then((pending) => {
      if (!pending || cancelled) return;
      timer = setTimeout(() => openPaywall("after_onboarding"), 2800);
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isHydrated, openPaywall]);

  const closePaywall = useCallback(() => {
    setPaywallOpen(false);
    setPaywallReason(null);
  }, []);

  const onPaywallOutcome = useCallback((kind: PaywallOutcome) => {
    void kind;
    closePaywall();
  }, [closePaywall]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    await configureRevenueCatBootstrap();
    if (!isPurchasesConfigured()) return false;
    try {
      const info = await restorePurchasesNative();
      await refreshEntitlements();
      return premiumActiveFromCustomerInfo(info);
    } catch {
      await refreshEntitlements();
      return false;
    }
  }, [refreshEntitlements]);

  const assertPremiumOrPaywall = useCallback(
    (reason: PremiumGateReason): boolean => {
      if (!isHydrated) return true;
      const gated = Platform.OS === "ios" && isRevenueCatAvailable();
      if (!gated || isPremium) return true;
      openPaywall(reason);
      return false;
    },
    [isHydrated, isPremium, openPaywall],
  );

  const assertAiGenerationAllowed = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "ios" || !isRevenueCatAvailable()) return true;
    await refreshEntitlements();
    const info = await fetchCustomerInfoSafe();
    const active = premiumActiveFromCustomerInfo(info);
    if (active) return true;
    const usedCount = await readFreeAiGenerationCount();
    setFreeUsed(usedCount);
    if (usedCount >= FREE_AI_REFLECTION_LIMIT) {
      openPaywall("compose_ai_quota");
      return false;
    }
    return true;
  }, [openPaywall, refreshEntitlements]);

  const recordSuccessfulAiGeneration = useCallback(async (composeModeId: string | null) => {
    if (composeModeId && !usesComplimentaryAiQuota(composeModeId)) {
      const u = await readFreeAiGenerationCount();
      setFreeUsed(u);
      return u;
    }
    if (Platform.OS !== "ios" || !isRevenueCatAvailable()) {
      const u = await readFreeAiGenerationCount();
      setFreeUsed(u);
      return u;
    }
    await configureRevenueCatBootstrap();
    const info = await fetchCustomerInfoSafe();
    if (premiumActiveFromCustomerInfo(info)) {
      const u = await readFreeAiGenerationCount();
      setFreeUsed(u);
      return u;
    }
    const n = await incrementFreeAiGenerationCount();
    setFreeUsed(n);
    if (n === 1) {
      setTimeout(() => openPaywall("after_first_generation"), 2200);
    }
    return n;
  }, [openPaywall]);

  const purchasesAvailable =
    Platform.OS === "ios" && isRevenueCatAvailable();

  const loading = purchasesAvailable && !isHydrated;

  const value = useMemo<PremiumContextValue>(
    () => ({
      isPremium,
      isHydrated,
      loading,
      purchasesAvailable,
      freeAiGenerationsUsed: freeUsed,
      openPaywall,
      closePaywall,
      refreshEntitlements,
      refreshPremiumStatus: refreshEntitlements,
      restorePurchases,
      assertAiGenerationAllowed,
      recordSuccessfulAiGeneration,
      assertPremiumOrPaywall,
    }),
    [
      isPremium,
      isHydrated,
      loading,
      purchasesAvailable,
      freeUsed,
      openPaywall,
      closePaywall,
      refreshEntitlements,
      restorePurchases,
      assertAiGenerationAllowed,
      recordSuccessfulAiGeneration,
      assertPremiumOrPaywall,
    ],
  );

  return (
    <PremiumCtx.Provider value={value}>
      <RevenueCatIdentityBridge onLogoutReset={onLogoutReset}>{children}</RevenueCatIdentityBridge>
      <PremiumPaywallModal
        visible={paywallOpen}
        reason={paywallReason}
        onOutcome={onPaywallOutcome}
        onPurchaseSuccess={refreshEntitlements}
      />
    </PremiumCtx.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const v = useContext(PremiumCtx);
  if (!v) throw new Error("usePremium requires PremiumProvider");
  return v;
}
