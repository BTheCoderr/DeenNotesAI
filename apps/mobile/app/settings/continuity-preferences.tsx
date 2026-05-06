import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ContinuityPreferencesV1 } from "../../src/contracts/continuity-preferences";
import {
  readContinuityPreferences,
  writeContinuityPreferences,
} from "../../src/lib/continuity-prefs-storage";
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

export default function ContinuityPreferencesScreen() {
  const [prefs, setPrefs] = useState<ContinuityPreferencesV1 | null>(null);

  const load = useCallback(async () => {
    setPrefs(await readContinuityPreferences());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function patch(next: Partial<ContinuityPreferencesV1>) {
    if (!prefs) return;
    const merged: ContinuityPreferencesV1 = { ...prefs, ...next, schemaVersion: 1 };
    setPrefs(merged);
    await writeContinuityPreferences(next);
    void load();
  }

  if (!prefs) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <Text style={styles.muted}>Gathering your saved preferences…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Continuity stays local and gentle — no punitive streaks or loss aversion. Counts are
          informational only.
        </Text>

        <View style={styles.card}>
          <RowToggle
            label="You returned today (gentle)"
            subtitle="Appears in medium widget preview and snapshot when you open the app today."
            value={prefs.showReturnToday}
            onValueChange={(v) => patch({ showReturnToday: v })}
          />
          <RowToggle
            label="Reflection timing recap"
            subtitle='Example: Last reflection was a few days ago — no rush.'
            value={prefs.showLastReflectionRecap}
            onValueChange={(v) => patch({ showLastReflectionRecap: v })}
          />
          <RowToggle
            label="Minimal phrasing"
            subtitle="Shorter copy with less warmth when you prefer silence."
            value={prefs.preferMinimalCopy}
            onValueChange={(v) => patch({ preferMinimalCopy: v })}
          />
        </View>
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
});
