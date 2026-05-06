import AsyncStorage from "@react-native-async-storage/async-storage";

import { logProductEvent } from "./mobile-product-events";

const KEY = "deennotes.analytics.first_reflection_saved.v1";

export async function logFirstReflectionSavedOnce(): Promise<void> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === "1") return;
    await AsyncStorage.setItem(KEY, "1");
    logProductEvent("first_reflection_saved", { once: true });
  } catch {
    /* offline storage edge — still avoid duplicate logs upstream */
  }
}
