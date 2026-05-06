import { Platform } from "react-native";

/** Primary tab bar row height (icons + labels) before per-device safe-area padding. */
export const MOBILE_TAB_BAR_BASE_PTS = Platform.select({ ios: 49, default: 56 }) ?? 56;

/** Bottom offset for floating chrome that must sit above the tab bar. */
export function mobileTabFloatingBottomOffset(bottomInset: number, liftPts = 12): number {
  return MOBILE_TAB_BAR_BASE_PTS + bottomInset + liftPts;
}
