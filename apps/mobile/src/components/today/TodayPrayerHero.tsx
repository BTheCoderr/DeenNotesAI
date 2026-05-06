import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";

import type { PrayerTodayPayload } from "../../api/types";
import { formatCountdown, formatPrayerInPhrase } from "../../lib/format-time";
import {
  border,
  bronze,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
} from "../../theme";

type Props = {
  data: PrayerTodayPayload;
  nextCountdownMs: number | null;
};

export function TodayPrayerHero({ data, nextCountdownMs }: Props) {
  const cur = data.schedule.currentPrayer;
  const curLine = data.schedule.currentLabel;

  return (
    <LinearGradient
      colors={["rgba(18,122,99,0.2)", "rgba(246,244,240,0.96)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.shell}
    >
      <Text style={styles.kicker}>Salah rhythm</Text>
      <Text style={styles.title}>{formatPrayerInPhrase(nextCountdownMs)}</Text>
      <Text style={styles.clockLine}>{formatCountdown(nextCountdownMs)}</Text>

      <View style={[styles.block, cur ? styles.blockGlow : null]}>
        <Text style={styles.eyebrow}>Now</Text>
        <Text style={styles.prayerName}>{cur ?? "Pause"}</Text>
        <Text style={styles.subtle}>{curLine}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.block}>
        <Text style={styles.eyebrow}>Next</Text>
        <Text style={styles.prayerNameEmerald}>{data.schedule.nextPrayer}</Text>
        <Text style={styles.countdown}>{formatCountdown(nextCountdownMs)}</Text>
      </View>

      <View style={styles.dateCol}>
        <Text style={styles.hijri}>{data.hijriLabel}</Text>
        <Text style={styles.greg}>
          {data.gregorianDateReadable}
          {data.timezone ? ` · ${data.timezone}` : ""}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 200,
  },
  kicker: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xl,
    color: ink,
    marginTop: -4,
  },
  clockLine: {
    fontSize: fontSizes.sm,
    fontVariant: ["tabular-nums"],
    color: muted,
    marginTop: -6,
  },
  block: { gap: 4 },
  blockGlow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.22)",
    backgroundColor: "rgba(255,255,255,0.45)",
    ...Platform.select({
      ios: {
        shadowColor: emerald,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  prayerName: {
    fontSize: fontSizes.xxl,
    fontWeight: "800",
    color: ink,
  },
  prayerNameEmerald: {
    fontSize: fontSizes.xxl,
    fontWeight: "800",
    color: emerald,
  },
  subtle: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  countdown: {
    fontSize: fontSizes.lg,
    fontVariant: ["tabular-nums"],
    color: ink,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  dateCol: { gap: 4, paddingTop: 4 },
  hijri: { fontSize: fontSizes.md, color: ink, fontWeight: "600" },
  greg: { fontSize: fontSizes.sm, color: muted },
});
