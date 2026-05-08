import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Platform, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WidgetMediumPreview } from "../../src/components/widget-previews/WidgetMediumPreview";
import { WidgetSmallPreview } from "../../src/components/widget-previews/WidgetSmallPreview";
import { readWidgetPreferences, writeWidgetPreferences } from "../../src/lib/widget-prefs-storage";
import { readWidgetSnapshot } from "../../src/lib/widget-snapshot";
import type { DeennotesWidgetSnapshotV1 } from "../../src/lib/widget-snapshot";
import type { WidgetPreferencesV1 } from "../../src/contracts/widget-preferences";
import { border, cardBg, fontSizes, ink, muted, radii, spacing, stone } from "../../src/theme";

function RowToggle({
  label,
  subtitle,
  value,
  onValueChange,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text style={styles.rowLbl}>{label}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function WidgetPreferencesScreen() {
  const [prefs, setPrefs] = useState<WidgetPreferencesV1 | null>(null);
  const [snap, setSnap] = useState<DeennotesWidgetSnapshotV1 | null>(null);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([readWidgetPreferences(), readWidgetSnapshot()]);
    setPrefs(p);
    setSnap(s);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function patch(next: Partial<WidgetPreferencesV1>) {
    if (!prefs) return;
    const merged = { ...prefs, ...next, schemaVersion: 1 as const };
    setPrefs(merged);
    await writeWidgetPreferences(next);
    void load();
  }

  if (!prefs) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <Text style={styles.muted}>Gathering widget previews…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          iOS widgets are not bundled in Expo Go — these layouts mirror what a WidgetKit extension would render from
          shared JSON once you add a native target.
        </Text>

        <RowToggle label="Widgets enabled" value={prefs.enabled} onValueChange={(v) => patch({ enabled: v })} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Included in glance payload</Text>
          <RowToggle
            label="Next prayer name"
            value={prefs.showNextPrayer}
            onValueChange={(v) => patch({ showNextPrayer: v })}
          />
          <RowToggle
            label="Countdown"
            value={prefs.showCountdown}
            onValueChange={(v) => patch({ showCountdown: v })}
          />
          <RowToggle
            label="Hijri date label"
            value={prefs.showHijri}
            onValueChange={(v) => patch({ showHijri: v })}
          />
          <RowToggle
            label="Daily ayah"
            subtitle="Uses chapter list + offline cache snippets when available."
            value={prefs.showDailyAyah}
            onValueChange={(v) => patch({ showDailyAyah: v })}
          />
          <RowToggle
            label="Continue reading"
            value={prefs.showContinueReading}
            onValueChange={(v) => patch({ showContinueReading: v })}
          />
          <RowToggle
            label="Reflection whisper"
            value={prefs.showReflectionReminder}
            onValueChange={(v) => patch({ showReflectionReminder: v })}
          />
          <RowToggle
            label="DeenNotes naming"
            subtitle="Ultra subtle small-widget label."
            value={prefs.showBranding}
            onValueChange={(v) => patch({ showBranding: v })}
          />
        </View>

        <Text style={styles.liveTitle}>Lockscreen / Live Activity readiness</Text>
        <Text style={styles.intro}>
          The latest snapshot persists{" "}
          <Text style={{ fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 12 }}>
            liveActivityPrep
          </Text>{" "}
          JSON for prayer countdown and Ramadan cues. ActivityKit Swift code lands in a later native
          pass.
        </Text>

        <Text style={styles.previewLabel}>Small (preview)</Text>
        <WidgetSmallPreview snap={snap} />

        <Text style={styles.previewLabel}>Medium (preview)</Text>
        <WidgetMediumPreview snap={snap} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 48, gap: spacing.md },
  intro: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  muted: { fontSize: fontSizes.sm, color: muted, padding: spacing.xl },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: fontSizes.sm, fontWeight: "800", color: ink },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border,
  },
  rowLbl: { fontSize: fontSizes.md, color: ink, fontWeight: "700" },
  rowSub: { fontSize: fontSizes.sm, color: muted, marginTop: 4, lineHeight: 18 },
  liveTitle: { fontSize: fontSizes.sm, fontWeight: "800", color: ink, marginTop: spacing.sm },
  previewLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
});
