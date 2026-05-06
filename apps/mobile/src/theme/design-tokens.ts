import { Platform, type ViewStyle } from "react-native";

/** Central design tokens — use via `apps/mobile/src/theme.ts` imports for consistency. */

export const colors = {
  stone: "#F6F4F0",
  emerald: "#127A63",
  stoneMuted: "#7A756C",
  mint: "#CFE8E0",
  bronze: "#B8860B",
  ink: "#1a1a1a",
  muted: "#5c5348",
  border: "rgba(0,0,0,0.06)",
  cardBg: "rgba(255,255,255,0.92)",
} as const;
export const ribbon = {
  background: "rgba(18,122,99,0.12)",
  border: "rgba(18,122,99,0.22)",
  text: "#0d4f40",
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
} as const;

/** Minimum a11y touch target (Apple HIG / Material). */
export const minTouchTarget = 44;

export const iconSizes = {
  sm: 18,
  md: 22,
  lg: 28,
} as const;

/** Subtle card elevation — warm, not Material harsh. */
export const shadowCard: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 1 },
  default: {},
}) ?? {};

/** Standard animation timings — keep short for calm, not bouncy. */
export const motion = {
  durationFast: 180,
  durationNormal: 280,
  spring: { damping: 18, stiffness: 220, mass: 0.8 } as const,
} as const;
