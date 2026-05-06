import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ONBOARDING_INTENTIONS,
  type OnboardingIntentionId,
  ONBOARDING_STEPS,
} from "../../../src/shared/onboarding";
import { DEENNOTES_SAFETY_DISCLAIMER } from "../../../src/shared/safety-copy";
import { border, bronze, cardBg, emerald, fontSizes, ink, muted, radii, spacing, stone } from "../src/theme";

const DONE_KEY = "deennotes.mobile.onboarding.v1";

export default function OnboardingScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [intentions, setIntentions] = useState<Set<OnboardingIntentionId>>(new Set());

  const step = ONBOARDING_STEPS[stepIndex];

  function toggleIntention(id: OnboardingIntentionId) {
    setIntentions((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function finish() {
    await AsyncStorage.setItem(DONE_KEY, "1");
    await AsyncStorage.setItem(
      "deennotes.mobile.onboarding.intentions.v1",
      JSON.stringify([...intentions]),
    );
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dots}>
          {stepIndex + 1} / {ONBOARDING_STEPS.length}
        </Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.prompt}>{step.emotionalPrompt}</Text>
        <Text style={styles.body}>{step.description}</Text>

        {step.id === "intentions" ? (
          <View style={styles.chips}>
            {ONBOARDING_INTENTIONS.map((opt) => {
              const on = intentions.has(opt.id);
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => toggleIntention(opt.id)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {(step.id === "quran_language" || step.id === "reflection_language") && (
          <View style={styles.placeholder}>
            <Text style={styles.muted}>
              Language pickers will load the same catalogs as the web app in a later milestone.
              For now, continue when you’re ready.
            </Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTxt}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
        </View>

        <View style={styles.actions}>
          {stepIndex > 0 ? (
            <Pressable
              onPress={() => setStepIndex((i) => i - 1)}
              style={styles.secondary}
            >
              <Text style={styles.secondaryTxt}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.secondary} />
          )}
          {stepIndex < ONBOARDING_STEPS.length - 1 ? (
            <Pressable
              onPress={() => setStepIndex((i) => i + 1)}
              style={styles.primary}
            >
              <Text style={styles.primaryTxt}>Continue</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => void finish()} style={styles.primary}>
              <Text style={styles.primaryTxt}>Enter DeenNotes</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  dots: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: { fontSize: 28, fontWeight: "800", color: ink, marginBottom: spacing.sm },
  prompt: {
    fontSize: fontSizes.md,
    color: emerald,
    fontStyle: "italic",
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22, marginBottom: spacing.lg },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    minHeight: 48,
    justifyContent: "center",
  },
  chipOn: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.1)",
  },
  chipTxt: { fontSize: fontSizes.md, color: ink, fontWeight: "600" },
  chipTxtOn: { color: emerald },
  placeholder: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    marginBottom: spacing.lg,
  },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  disclaimer: { marginVertical: spacing.lg },
  disclaimerTxt: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primary: {
    flex: 1,
    backgroundColor: emerald,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  secondary: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  secondaryTxt: { color: ink, fontWeight: "700", fontSize: fontSizes.md },
});
