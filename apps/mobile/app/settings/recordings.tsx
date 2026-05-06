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

export default function RecordingsHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Khutbah recordings</Text>
        <Text style={styles.lead}>
          Audio you capture stays on this phone until you delete it locally. Reflections crafted from recordings sync
          when you sign in, without uploading raw audio.
        </Text>
        <Pressable style={styles.primary} onPress={() => router.push("/recordings")}>
          <Text style={styles.primaryTxt}>Open recordings library</Text>
        </Pressable>
        <View style={styles.card}>
          <Text style={styles.note}>
            Need a fresh capture? From Reflect → New reflection → Record khutbah, or tap the recorder from the compose
            flow.
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
    marginTop: spacing.sm,
    backgroundColor: emerald,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  card: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: cardBg,
    padding: spacing.lg,
  },
  note: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
});
