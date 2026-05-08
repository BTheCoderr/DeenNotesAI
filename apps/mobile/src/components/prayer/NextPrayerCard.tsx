import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PrayerName, PrayerTodayPayload } from "../../api/types";
import { formatCountdown } from "../../lib/format-time";
import { formatNextPrayerCountdown } from "../../services/prayerTimesService";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
} from "../../theme";

type Props = {
  data: PrayerTodayPayload | null | undefined;
  loading?: boolean;
  error?: unknown;
  /** Prefer false when embedding under another prayer hero. */
  showFallback?: boolean;
  /** Opens reminder / preferences flow (e.g. Prayer tab Preferences). */
  onManageReminders: () => void;
};

function nextPrayerTimeText(data: PrayerTodayPayload): string | null {
  const name = data.schedule.nextPrayer as PrayerName;
  return data.timings[name] ?? null;
}

/** Next prayer summary with countdown pulse + reminders CTA. */
export function NextPrayerCard({
  data,
  loading,
  error,
  showFallback = true,
  onManageReminders,
}: Props) {
  const ok = Boolean(data && "ok" in data && data.ok);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!ok) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [ok]);

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Next prayer</Text>
        <Text style={styles.muted}>Gathering salah times…</Text>
      </View>
    );
  }

  if (!ok) {
    if (!showFallback) return null;
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Prayer rhythm</Text>
        <Text style={styles.titleMuted}>Salah times are resting</Text>
        <Text style={styles.body}>
          Location may be muted or offline. Tune city under Prayer → Preferences — we never rush the heart toward
          error screens.
        </Text>
        {__DEV__ && error instanceof Error ? <Text style={styles.dev}>{error.message}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage prayer reminders"
          style={styles.cta}
          onPress={onManageReminders}
        >
          <Text style={styles.ctaTxt}>Manage prayer reminders</Text>
        </Pressable>
      </View>
    );
  }

  const prayer = data as PrayerTodayPayload;
  const nextMs =
    prayer.schedule.nextAtEpochMs != null
      ? Math.max(0, prayer.schedule.nextAtEpochMs - Date.now())
      : null;

  const timeWall = nextPrayerTimeText(prayer);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Next prayer</Text>
      <Text style={styles.prayerLine}>
        <Text style={styles.prayerName}>{prayer.schedule.nextPrayer}</Text>
        <Text style={styles.dim}> · </Text>
        <Text style={styles.time}>{timeWall ?? "—"}</Text>
      </Text>
      <Text style={styles.countLine}>
        <Text style={styles.dim}>In </Text>
        <Text style={styles.em}>{formatNextPrayerCountdown(nextMs)}</Text>
        <Text style={styles.tick}> ({formatCountdown(nextMs)})</Text>
      </Text>
      {prayer.locationLabel ? (
        <Text style={styles.location}>{prayer.locationLabel}</Text>
      ) : (
        <Text style={styles.locationMuted}>Locality will appear once times settle.</Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Manage prayer reminders"
        style={styles.cta}
        onPress={onManageReminders}
      >
        <Text style={styles.ctaTxt}>Manage prayer reminders</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  prayerLine: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: 4 },
  prayerName: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: emerald,
  },
  time: { fontSize: fontSizes.lg, fontWeight: "700", color: ink },
  dim: { color: muted, fontWeight: "600" },
  countLine: { marginTop: 2 },
  em: { color: emerald, fontWeight: "800", fontSize: fontSizes.md },
  tick: { fontSize: fontSizes.sm, color: muted, fontVariant: ["tabular-nums"] },
  location: { fontSize: fontSizes.xs, color: muted, marginTop: 4 },
  locationMuted: { fontSize: fontSizes.xs, color: muted, fontStyle: "italic", marginTop: 4 },
  titleMuted: { fontFamily: fontSerifHeading, fontSize: fontSizes.lg, color: ink, fontWeight: "600" },
  body: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  muted: { fontSize: fontSizes.sm, color: muted },
  dev: { fontSize: 10, color: "#8b2942", marginTop: 6 },
  cta: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.35)",
    backgroundColor: "rgba(18,122,99,0.08)",
    minHeight: 44,
    justifyContent: "center",
  },
  ctaTxt: { fontSize: fontSizes.sm, fontWeight: "800", color: emerald },
});
