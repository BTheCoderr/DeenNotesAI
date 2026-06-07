import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DEFAULT_LEARNING_MODE,
  LEARNING_MODE_DISCLAIMER,
  type LearningModePreferences,
} from "../../src/contracts/learning-mode";
import { readLearningMode, writeLearningMode } from "../../src/lib/learning-mode-storage";
import {
  border,
  bronze,
  cardBg,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

export default function LearningModeSettingsScreen() {
  const [prefs, setPrefs] = useState<LearningModePreferences>(DEFAULT_LEARNING_MODE);

  const load = useCallback(async () => {
    setPrefs(await readLearningMode());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onToggle(enabled: boolean) {
    const next = await writeLearningMode({ enabled });
    setPrefs(next);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Learning mode uses gentler language across Today and Salah Planner — helpful if you are
          new to Islam or prefer less Arabic-heavy copy.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowTxt}>
              <Text style={styles.rowLbl}>Learning mode</Text>
              <Text style={styles.rowSub}>
                Beginner-friendly explanations and softer prompts
              </Text>
            </View>
            <Switch
              value={prefs.enabled}
              onValueChange={(v) => void onToggle(v)}
              accessibilityLabel="Learning mode"
            />
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerKicker}>Important</Text>
          <Text style={styles.disclaimerBody}>{LEARNING_MODE_DISCLAIMER}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What changes</Text>
          <Text style={styles.bullet}>• Salah Planner uses simpler task and reflection copy</Text>
          <Text style={styles.bullet}>• Today tab planner card uses gentler language</Text>
          <Text style={styles.bullet}>• Core prayer times and Quran reading stay the same</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What stays the same</Text>
          <Text style={styles.bullet}>• Prayer reminders and Adhan options</Text>
          <Text style={styles.bullet}>• Quran reading, recitation, and translations</Text>
          <Text style={styles.bullet}>• Reflection capture and sign-in sync</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 48, gap: spacing.md },
  intro: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
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
    gap: spacing.md,
  },
  rowTxt: { flex: 1 },
  rowLbl: { fontSize: fontSizes.md, color: ink, fontWeight: "700" },
  rowSub: { fontSize: fontSizes.sm, color: muted, marginTop: 4, lineHeight: 18 },
  disclaimer: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.35)",
    backgroundColor: "rgba(184,134,11,0.08)",
    padding: spacing.md,
    gap: spacing.xs,
  },
  disclaimerKicker: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  disclaimerBody: { fontSize: fontSizes.sm, color: ink, lineHeight: 22 },
  sectionTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.md,
    color: ink,
    marginBottom: spacing.xs,
  },
  bullet: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
});
