import { StyleSheet } from "react-native";

export const stone = "#F6F4F0";
export const emerald = "#127A63";
export const bronze = "#B8860B";
export const ink = "#1a1a1a";
export const muted = "#5c5348";
export const border = "rgba(0,0,0,0.06)";
export const cardBg = "rgba(255,255,255,0.92)";

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

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
