import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePrayerToday } from "../../src/api/hooks/usePrayerToday";
import { NextPrayerCard } from "../../src/components/prayer/NextPrayerCard";
import { QIBLA_ROUTE } from "../../src/contracts/nav";
import {
  bronze,
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

export default function PrayerSettingsHubScreen() {
  const router = useRouter();
  const { data, error, isLoading } = usePrayerToday();

  const payload = data && "ok" in data && data.ok ? data : null;
  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Prayer Preferences</Text>
        <Text style={styles.lead}>
          Quiet times, calculation method, location, and humble nudges before each ṣalāh stay on the Prayer tab —
          tuned for clarity, not alarms.
        </Text>
        <Pressable style={styles.primary} onPress={() => router.push("/(tabs)/prayer")}>
          <Text style={styles.primaryTxt}>Open Prayer</Text>
        </Pressable>

        <Pressable
          style={styles.qiblaRow}
          onPress={() => router.push(QIBLA_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Qibla compass"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.qiblaTitle}>Qibla compass</Text>
            <Text style={styles.qiblaSub}>Direction of the Kaaba from your saved location</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={muted} />
        </Pressable>

        <NextPrayerCard
          data={payload}
          loading={isLoading}
          error={error}
          onManageReminders={() => router.push("/(tabs)/prayer")}
        />
        <Text style={styles.hint}>Tip: Open the Prayer tab, then choose Preferences for methods, reminders, and location.</Text>

        <View style={styles.card}>
          <Text style={styles.k}>While you&apos;re here</Text>
          <Text style={styles.body}>
            Ramadan overlays and countdowns also live on Prayer — paired with Qur&apos;an reading when you&apos;re ready.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { padding: spacing.xl, gap: spacing.md },
  h1: { fontFamily: fontSerifHeading, fontSize: 26, fontWeight: "600", color: ink },
  lead: { fontSize: fontSizes.md, color: muted, lineHeight: 24 },
  primary: {
    backgroundColor: emerald,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  qiblaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: cardBg,
  },
  qiblaTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  qiblaSub: { fontSize: fontSizes.sm, color: muted, marginTop: 4, lineHeight: 18 },
  hint: { fontSize: fontSizes.sm, color: bronze, lineHeight: 20, marginTop: spacing.sm },
  card: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: cardBg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  k: {
    fontSize: 11,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
});
