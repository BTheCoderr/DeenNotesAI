import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SALAH_PLANNER_ROUTE } from "../../contracts/nav";
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
  completed: number;
  total: number;
  learningMode?: boolean;
};

export function SalahPlannerEntryCard({ completed, total, learningMode = false }: Props) {
  const router = useRouter();
  const hasTasks = total > 0;
  const allDone = hasTasks && completed === total;

  const progressLine = !hasTasks
    ? learningMode
      ? "Add a small step for each prayer window when you're ready."
      : "Add tasks around today's five prayers."
    : allDone
      ? learningMode
        ? "You tended today's plan — barakallahu feek."
        : "Today's plan complete — may it carry into the next prayer."
      : learningMode
        ? `${completed} of ${total} gentle steps done`
        : `${completed} of ${total} tasks complete`;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(SALAH_PLANNER_ROUTE)}
      accessibilityRole="button"
      accessibilityLabel="Salah Planner"
      accessibilityHint="Plan tasks around today's five prayers"
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="calendar-outline" size={22} color={emerald} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>
            {learningMode ? "Today's gentle plan" : "Salah Planner"}
          </Text>
          <Text style={styles.title}>
            {learningMode ? "Your day around prayer" : "Today's plan"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={muted} />
      </View>
      <Text style={styles.body}>{progressLine}</Text>
      {hasTasks ? (
        <View style={styles.progressTrack} accessibilityLabel={`${completed} of ${total} complete`}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round((completed / total) * 100)}%` },
            ]}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: "rgba(18,122,99,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1, gap: 2 },
  kicker: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    color: ink,
  },
  body: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: emerald,
    borderRadius: radii.pill,
  },
});
