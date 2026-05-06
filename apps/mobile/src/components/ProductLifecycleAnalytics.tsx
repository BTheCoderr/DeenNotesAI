import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { maybeLogRetentionDailyOpen } from "../lib/analytics/retention-daily";

/** Session / retention breadcrumbs — no identifiers, no devotional content. */
export function ProductLifecycleAnalytics() {
  useEffect(() => {
    void maybeLogRetentionDailyOpen();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s: AppStateStatus) => {
      if (s === "active") void maybeLogRetentionDailyOpen();
    });
    return () => sub.remove();
  }, []);

  return null;
}
