import { Platform, StyleSheet } from "react-native";

import {
  colors,
  fontSizes,
  iconSizes,
  minTouchTarget,
  motion,
  radii,
  ribbon,
  shadowCard,
  spacing,
} from "./theme/design-tokens";

export const stone = colors.stone;
export const emerald = colors.emerald;
export const stoneMuted = colors.stoneMuted;
export const mint = colors.mint;
export const bronze = colors.bronze;
export const ink = colors.ink;
export const muted = colors.muted;
export const border = colors.border;
export const cardBg = colors.cardBg;

export const offlineRibbonColors = ribbon;

export { fontSizes, radii, spacing, shadowCard, minTouchTarget, iconSizes, motion };

/** Fraunces loads in `app/_layout.tsx`; fallback for web / if load fails. */
export const fontSerifHeading = Platform.select({
  ios: "Fraunces_700Bold",
  android: "Fraunces_700Bold",
  web: "Georgia",
  default: "serif",
});

export const baseScreen = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: stone,
  },
  pad: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
