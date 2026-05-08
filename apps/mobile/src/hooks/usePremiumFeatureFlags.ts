import { useMemo } from "react";

import { derivePremiumFeatureFlags } from "../contracts/premium-features";
import { usePremium } from "./usePremium";

export function usePremiumFeatureFlags() {
  const { isPremium, purchasesAvailable } = usePremium();
  return useMemo(
    () => derivePremiumFeatureFlags({ isPremium, purchasesAvailable }),
    [isPremium, purchasesAvailable],
  );
}
