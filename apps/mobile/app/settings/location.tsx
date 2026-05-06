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

export default function LocationSettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Location for prayer</Text>
        <Text style={styles.lead}>
          DeenNotes uses your city-level position to suggest ṣalāh times. Nothing is shared beyond what your device
          already allows for location services.
        </Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            Enable precise location in iOS Settings if times feel off, or set a manual city inside the Prayer tab when
            you prefer not to share GPS.
          </Text>
        </View>
        <Pressable style={styles.primary} onPress={() => router.push("/(tabs)/prayer")}>
          <Text style={styles.primaryTxt}>Adjust in Prayer</Text>
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
