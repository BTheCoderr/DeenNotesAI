import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ContinueReadingState } from "../../lib/quran-continue-reading";
import { border, bronze, cardBg, emerald, fontSerifHeading, fontSizes, ink, muted, radii, spacing } from "../../theme";

type Props = {
  state: ContinueReadingState | null;
};

export function ContinueReadingCard({ state }: Props) {
  const line =
    state != null
      ? `Surah ${state.surahId} · Ayah ${state.ayah}`
      : "No bookmark yet — open the Quran when you’re ready.";

  return (
    <View style={styles.card}>
      <Text style={styles.h2}>Continue reading</Text>
      <Text style={styles.meta}>{line}</Text>
      <Text style={styles.soft}>Return gently. The page will wait for you.</Text>
      <Link
        href={state != null ? `/quran/${state.surahId}` : "/quran/1"}
        asChild
      >
        <Pressable style={styles.btn} accessibilityRole="button">
          <Text style={styles.btnTxt}>
            {state != null ? "Resume" : "Open Quran"}
          </Text>
        </Pressable>
      </Link>
    </View>
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
  h2: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    color: ink,
  },
  meta: { fontSize: fontSizes.md, color: ink, fontWeight: "600" },
  soft: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  btn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: fontSizes.md },
});
