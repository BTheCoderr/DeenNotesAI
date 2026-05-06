import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiUrl } from "../../src/lib/apiBase";
import { fontSizes, ink, muted, spacing, stone } from "../../src/theme";

export default function QuranReaderScreen() {
  const { surah } = useLocalSearchParams<{ surah: string }>();
  const router = useRouter();
  const sid = Array.isArray(surah) ? surah[0] : surah;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.pad}>
        <Text style={styles.h1}>Surah {sid ?? "—"}</Text>
        <Text style={styles.body}>
          Verse bodies will stream from the existing Next proxy: {"\n"}
          <Text style={styles.mono}>{apiUrl(`/api/quran/chapters/${sid}/verses`)}</Text>
        </Text>
        <Text style={styles.muted}>
          This screen is a navigation shell — ayah rendering and audio use the same contracts as
          the web reader.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backTxt}>Back to list</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { flex: 1, padding: spacing.xl, gap: spacing.md },
  h1: { fontSize: 28, fontWeight: "800", color: ink },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
  mono: { fontSize: 12, color: ink },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  back: {
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  backTxt: { fontWeight: "700", color: ink },
});
