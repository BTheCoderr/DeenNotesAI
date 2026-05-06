import { StyleSheet, Text, View } from "react-native";

import { border, bronze, cardBg, fontSerifHeading, fontSizes, ink, muted, radii, spacing } from "../../theme";

type Props = {
  showFriday: boolean;
  showRamadan: boolean;
  ramadanDay?: number | null;
};

export function DayContextCards({ showFriday, showRamadan, ramadanDay }: Props) {
  if (!showFriday && !showRamadan) return null;

  return (
    <View style={styles.gap}>
      {showFriday ? (
        <View style={styles.card}>
          <Text style={styles.k}>Jumu&apos;ah</Text>
          <Text style={styles.h2}>A gentler noon pause</Text>
          <Text style={styles.body}>
            Step away slowly from noise toward the mosque or your prayer space — no hustle framing,
            just presence.
          </Text>
        </View>
      ) : null}
      {showRamadan ? (
        <View style={styles.card}>
          <Text style={styles.k}>Ramadan</Text>
          <Text style={styles.h2}>Day {typeof ramadanDay === "number" ? ramadanDay : "—"} · soft pacing</Text>
          <Text style={styles.body}>
            Suhoor and iftar times follow your Prayer tab settings. Let notifications be whispers, not
            alarms.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.md },
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  k: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h2: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    color: ink,
  },
  body: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
});
