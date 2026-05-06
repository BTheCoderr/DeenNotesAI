import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  cardBg,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

export default function HijriRamadanSettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Hijri & Ramadan</Text>
        <Text style={styles.lead}>
          Gentle Ramadan overlays, tarawīh-friendly language, and month-aware cues stay beside your prayer planner —
          oriented around humility, not scorekeeping.
        </Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            Open the Prayer tab → Ramadan segment to see tonight-focused copy and timelines that respect where you are
            in the month.
          </Text>
        </View>
        <Pressable style={styles.primary} onPress={() => router.push("/(tabs)/prayer")}>
          <Text style={styles.primaryTxt}>Open Prayer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { padding: spacing.xl, gap: spacing.md },
  h1: { fontFamily: fontSerifHeading, fontSize: 26, fontWeight: "600", color: ink },
  lead: { fontSize: fontSizes.md, color: muted, lineHeight: 24 },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: cardBg,
    padding: spacing.lg,
  },
  body: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  primary: {
    backgroundColor: emerald,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
});
