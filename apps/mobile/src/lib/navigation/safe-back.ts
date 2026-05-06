import type { Href, Router } from "expo-router";

/** Minimal navigation object that can answer `canGoBack` / `goBack` (e.g. `@react-navigation/native`). */
export type SafeBackNavigation = {
  canGoBack?: () => boolean;
  goBack?: () => void;
};

/**
 * Prefer the screen’s React Navigation stack (`canGoBack`). If that is empty, try modal dismiss, then
 * root `router.canGoBack()`, and finally `replace` so we never enqueue an unhandled GO_BACK.
 */
export function safeBack(
  router: Router,
  navigation: SafeBackNavigation | undefined,
  fallback: Href = "/(tabs)",
): void {
  if (navigation?.canGoBack?.()) {
    navigation.goBack?.();
    return;
  }
  if (router.canDismiss()) {
    router.dismiss();
    return;
  }
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
