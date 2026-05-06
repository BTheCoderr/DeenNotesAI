import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NOTE_MODE_CONTRACTS } from "../../src/contracts/note-modes";
import type { NoteModeId } from "../../src/contracts/note-modes";
import { emerald, fontSizes, ink, muted, radii, spacing, stone } from "../../src/theme";

const IDS = new Set(NOTE_MODE_CONTRACTS.map((m) => m.id));

export default function ComposeModeScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const router = useRouter();
  const raw = Array.isArray(mode) ? mode[0] : mode;
  const valid = raw && IDS.has(raw as NoteModeId);
  const id = valid ? (raw as NoteModeId) : null;
  const meta = id ? NOTE_MODE_CONTRACTS.find((m) => m.id === id) : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.inner}>
        <Text style={styles.h1}>{meta?.label ?? "Reflection"}</Text>
        {!valid ? (
          <Text style={styles.body}>Unknown capture mode. Go back and pick again.</Text>
        ) : (
          <Text style={styles.body}>
            This compose surface is a placeholder. It will call the existing Next.js route{" "}
            <Text style={styles.mono}>/api/generate-note</Text> once mobile auth + note drafting are
            wired — no backend changes required.
          </Text>
        )}
        <Pressable onPress={() => router.back()} style={styles.btn}>
          <Text style={styles.btnTxt}>Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  inner: { flex: 1, padding: spacing.xl, gap: spacing.md },
  h1: { fontSize: fontSizes.xl, fontWeight: "700", color: ink },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
  mono: { fontSize: 13, color: ink, fontWeight: "600" },
  btn: {
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: fontSizes.md },
});
