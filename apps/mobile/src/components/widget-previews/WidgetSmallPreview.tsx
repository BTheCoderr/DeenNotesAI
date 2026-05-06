import { StyleSheet, Text, View } from "react-native";

import type { DeennotesWidgetSnapshotV1 } from "../../lib/widget-snapshot";
import { border, bronze, cardBg, emerald, fontSerifHeading, fontSizes, ink, muted, radii, spacing } from "../../theme";

type Props = {
  snap: DeennotesWidgetSnapshotV1 | null;
};

/** In-app layout matching a 2×2 iOS small widget (not a native widget binary). */
export function WidgetSmallPreview({ snap }: Props) {
  const p = snap?.prayer;

  return (
    <View style={styles.shell}>
      {snap?.widgetPrefs?.showBranding !== false ? (
        <Text style={styles.brand}>DeenNotes</Text>
      ) : (
        <Text style={styles.note}>Branding hidden in native widget</Text>
      )}
      <View style={styles.body}>
        <Text style={styles.nextLabel}>Next</Text>
        <Text style={styles.nextName}>{p?.nextPrayerName ?? "—"}</Text>
        <Text style={styles.count}>{p?.countdownLabel ?? "—"}</Text>
        <Text style={styles.soft}>{p?.softPhrase ?? ""}</Text>
        <Text style={styles.hijri}>{p?.hijriLabel ?? "Hijri …"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 140,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: "hidden",
  },
  brand: {
    fontSize: 10,
    fontWeight: "800",
    color: emerald,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.85,
  },
  note: { fontSize: 10, color: muted },
  body: { flex: 1, gap: 4, justifyContent: "center" },
  nextLabel: { fontSize: 10, fontWeight: "800", color: bronze, textTransform: "uppercase" },
  nextName: { fontFamily: fontSerifHeading, fontSize: 22, color: ink },
  count: { fontSize: fontSizes.md, fontWeight: "700", color: ink, fontVariant: ["tabular-nums"] },
  soft: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  hijri: { fontSize: fontSizes.sm, color: muted, marginTop: 4 },
});
