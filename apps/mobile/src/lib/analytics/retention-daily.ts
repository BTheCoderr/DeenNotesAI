import AsyncStorage from "@react-native-async-storage/async-storage";

import { logProductEvent } from "./mobile-product-events";

const DAY_KEY = "deennotes.analytics.retention_logged_day.v1";

let runningGuard = false;

function civilDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Logs `retention_session` at most once per local civil day across launches and resumes.
 */
export async function maybeLogRetentionDailyOpen(): Promise<void> {
  if (runningGuard) return;
  runningGuard = true;
  try {
    const today = civilDay(new Date());
    let shouldLog = false;
    try {
      const prev = (await AsyncStorage.getItem(DAY_KEY)) ?? "";
      if (prev === today) return;
      await AsyncStorage.setItem(DAY_KEY, today);
      shouldLog = true;
    } catch {
      shouldLog = true;
    }
    if (shouldLog) logProductEvent("retention_session", { civil_day: today });
  } finally {
    runningGuard = false;
  }
}
