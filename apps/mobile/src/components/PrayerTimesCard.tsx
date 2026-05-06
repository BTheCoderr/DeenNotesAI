import { StyleSheet, Text, View } from "react-native";

import type { PrayerName } from "../api/types";
import { border, cardBg, emerald, fontSizes, ink, muted, radii, spacing } from "../theme";

const DISPLAY_ORDER: PrayerName[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

type Props = {
  timings: Record<PrayerName, string>;
  nextPrayer: PrayerName;
  currentPrayer: PrayerName | null;
};

function rowActive(name: PrayerName, next: PrayerName, current: PrayerName | null) {
  return name === next || name === current;
}

export function PrayerTimesCard({ timings, nextPrayer, currentPrayer }: Props) {
  return (
    <View style={styles.wrap}>
      {DISPLAY_ORDER.map((name) => {
        const active = rowActive(name, nextPrayer, currentPrayer);
        return (
          <View
            key={name}
            style={[styles.row, active ? styles.rowActive : styles.rowIdle]}
          >
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.time}>{timings[name] ?? "—"}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  rowActive: {
    backgroundColor: "rgba(18,122,99,0.08)",
    borderWidth: 1,
    borderColor: emerald,
  },
  rowIdle: {
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: border,
  },
  name: { fontSize: fontSizes.md, fontWeight: "600", color: ink },
  time: { fontSize: fontSizes.md, color: muted, fontVariant: ["tabular-nums"] },
});
