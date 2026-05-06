import type { ComponentProps } from "react";

import { Ionicons } from "@expo/vector-icons";
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

type Ion = ComponentProps<typeof Ionicons>["name"];

function Row({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: Ion;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={22} color={emerald} style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={muted} />
    </Pressable>
  );
}

/** Hub for Quran-related settings; detailed controls live under `/quran/settings` and Offline Quran. */
export default function QuranSettingsHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Quran preferences</Text>
        <Text style={styles.lead}>
          Tune translation language, tafsir depth, narration, immersive reading, and careful audio downloads.
        </Text>

        <View style={styles.card}>
          <Row
            icon="book-outline"
            title="Reading & translation"
            subtitle="Language, immersion, Ramadan pacing cues"
            onPress={() => router.push("/quran/settings")}
          />
          <View style={styles.sep} />
          <Row
            icon="musical-notes-outline"
            title="Reciter & audio quality"
            subtitle="Choose narration and caching guardrails"
            onPress={() => router.push("/quran/settings")}
          />
          <View style={styles.sep} />
          <Row
            icon="download-outline"
            title="Offline Quran cache"
            subtitle="How many surahs stay reverently on-device"
            onPress={() => router.push("/settings/offline")}
          />
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
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: cardBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
    minHeight: 56,
  },
  icon: { width: 28 },
  rowTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  rowSub: { fontSize: fontSizes.sm, color: muted, marginTop: 2, lineHeight: 18 },
  sep: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginLeft: 28 + spacing.md },
});
