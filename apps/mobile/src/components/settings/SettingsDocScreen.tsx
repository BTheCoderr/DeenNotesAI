import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { emerald, fontSerifHeading, fontSizes, ink, muted, spacing, stone } from "../../theme";

export function SettingsDocScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{title}</Text>
        <View style={styles.body}>{children}</View>
        <Text style={styles.footer}>DeenNotes — private-first reflection and Qur&apos;an tools.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 48, gap: spacing.md },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 26,
    fontWeight: "600",
    color: ink,
  },
  body: { gap: spacing.md },
  p: { fontSize: fontSizes.md, color: muted, lineHeight: 24 },
  footer: { fontSize: fontSizes.xs, color: emerald, fontWeight: "700", marginTop: spacing.lg },
});
