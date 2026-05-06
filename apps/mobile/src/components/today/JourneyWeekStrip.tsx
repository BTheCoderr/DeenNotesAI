import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { localCalendarDayKey, readVisitDaySet } from "../../lib/continuity-storage";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
} from "../../theme";

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function startOfWeekSunday(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - dow);
  return x;
}

type Props = {
  /** Bump when screen focuses to refresh visit dots */
  revision?: number;
};

export function JourneyWeekStrip({ revision = 0 }: Props) {
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    void readVisitDaySet().then((s) => {
      if (!cancelled) setVisited(s);
    });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const { cells } = useMemo(() => {
    const now = new Date();
    const start = startOfWeekSunday(now);
    const tk = localCalendarDayKey(now);
    const list: { key: string; dayNum: number; letter: string; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i += 1) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + i);
      const key = localCalendarDayKey(cell);
      list.push({
        key,
        dayNum: cell.getDate(),
        letter: WEEK_LETTERS[i] ?? "·",
        isToday: key === tk,
      });
    }
    return { cells: list };
  }, []);

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.row}>
        {cells.map((c) => {
          const hasVisit = visited.has(c.key);
          return (
            <View key={c.key} style={styles.cell}>
              <Text style={styles.letter}>{c.letter}</Text>
              <View
                style={[
                  styles.dayBubble,
                  c.isToday && styles.dayBubbleToday,
                  hasVisit && !c.isToday && styles.dayBubbleVisited,
                ]}
              >
                <Text style={[styles.num, c.isToday && styles.numToday]}>{c.dayNum}</Text>
              </View>
              <View style={styles.dotRow}>
                {c.isToday ? <View style={styles.dotToday} /> : <View style={styles.dotPlaceholder} />}
              </View>
            </View>
          );
        })}
      </View>
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
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cell: { flex: 1, alignItems: "center", gap: 6 },
  letter: {
    fontSize: 11,
    fontWeight: "800",
    color: muted,
    letterSpacing: 0.2,
  },
  dayBubble: {
    minWidth: 36,
    minHeight: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "rgba(246,244,240,0.65)",
  },
  dayBubbleToday: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.08)",
  },
  dayBubbleVisited: {
    borderColor: "rgba(184,134,11,0.35)",
    backgroundColor: "rgba(184,134,11,0.06)",
  },
  num: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  numToday: { color: emerald },
  dotRow: { height: 6, justifyContent: "center" },
  dotToday: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: bronze,
  },
  dotPlaceholder: { width: 5, height: 5 },
});
