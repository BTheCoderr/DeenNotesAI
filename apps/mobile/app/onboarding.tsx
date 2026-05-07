import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { MobileWordmark } from "../src/components/brand/MobileWordmark";
import {
  ONBOARDING_INTENTIONS,
  ONBOARDING_STEPS,
  type OnboardingAnswersContract,
  type OnboardingIntentionId,
} from "../src/contracts/onboarding";
import { REFLECTION_LANGUAGE_OPTIONS } from "../src/contracts/quran-preferences";
import type { ReflectionLanguageCode } from "../src/contracts/quran-preferences";
import { DEENNOTES_SAFETY_DISCLAIMER } from "../src/contracts/safety-copy";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../src/theme";

import { writeMobileQuranPrefs } from "../src/lib/mobile-quran-prefs";
import { logProductEvent } from "../src/lib/analytics/mobile-product-events";
import { getLegalPrivacyUrl, getLegalTermsUrl } from "../src/lib/purchases/expo-extra";
import { setPaywallTriggerAfterOnboarding } from "../src/lib/purchases/premium-storage";
const DONE_KEY = "deennotes.mobile.onboarding.v1";
const ANSWERS_KEY = "deennotes.mobile.onboarding.answers.v1";

export default function OnboardingScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [intentions, setIntentions] = useState<Set<OnboardingIntentionId>>(new Set());
  const [quranLang, setQuranLang] = useState<ReflectionLanguageCode>("en");
  const [reflectionLang, setReflectionLang] = useState<ReflectionLanguageCode>("en");

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  function go(delta: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStepIndex((i) => Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, i + delta)));
  }
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
    const answers: OnboardingAnswersContract = {
      journeyGoals: [...intentions],
      preferredQuranEncTranslationKey: quranLang,
      reflectionLanguage: reflectionLang,
      completedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DONE_KEY, "1");
    await setPaywallTriggerAfterOnboarding();
    await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    await writeMobileQuranPrefs({
      language: reflectionLang,
      translationKey: quranLang,
    });
    logProductEvent("onboarding_completed", { steps: ONBOARDING_STEPS.length });
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MobileWordmark height={30} padded style={{ alignSelf: "flex-start", marginBottom: spacing.sm }} />
        <Text style={styles.dots}>
          {stepIndex + 1} / {ONBOARDING_STEPS.length}
        </Text>
        <Text style={styles.stepFoot}>
          {stepIndex === 0
            ? "Tap Back to open Today — we'll save gentle defaults; you can change them in Settings anytime."
            : "You can go Back anytime — nothing here is scored or required."}
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
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{opt.label}</Text>
                </Pressable>
              );
            })}
            <Text style={styles.chipHint}>Tap what resonates — skipping all is fine.</Text>
          </View>
        ) : null}

        {step.id === "quran_language" ? (
          <View style={styles.card}>
            <Text style={styles.muted}>Stored locally as a gentle default beside Arabic.</Text>
            <View style={styles.langChips}>
              {REFLECTION_LANGUAGE_OPTIONS.map((opt) => {
                const on = quranLang === opt.code;
                return (
                  <Pressable
                    key={opt.code}
                    onPress={() => setQuranLang(opt.code)}
                    style={[styles.chip, on && styles.chipOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {step.id === "reflection_language" ? (
          <View style={styles.card}>
            <Text style={styles.muted}>Separate from Qur&apos;an Arabic.</Text>
            <View style={styles.langChips}>
              {REFLECTION_LANGUAGE_OPTIONS.map((opt) => {
                const on = reflectionLang === opt.code;
                return (
                  <Pressable
                    key={`r-${opt.code}`}
                    onPress={() => setReflectionLang(opt.code)}
                    style={[styles.chip, on && styles.chipOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {step.id === "completion" ? (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>You&apos;re landing on Today first</Text>
              <Text style={styles.successBody}>
                Prayer rhythm shows at the top — Qur&apos;an and reflection stay one tap away when you want them.
              </Text>
            </View>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTxt}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
            </View>
          </>
        ) : (
          <View style={{ marginBottom: spacing.md }} />
        )}

        <View style={styles.actions}>
          {stepIndex > 0 ? (
            <Pressable
              onPress={() => go(-1)}
              style={styles.secondary}
              accessibilityRole="button"
              accessibilityLabel="Previous onboarding step"
            >
              <Text style={styles.secondaryTxt}>Back</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void finish()}
              style={styles.secondary}
              accessibilityRole="button"
              accessibilityLabel="Leave onboarding and open Today with defaults"
              accessibilityHint="Saves sensible language defaults and opens the Today tab."
            >
              <Text style={styles.secondaryTxt}>Back</Text>
            </Pressable>
          )}
          {stepIndex < ONBOARDING_STEPS.length - 1 ? (
            <Pressable onPress={() => go(1)} style={styles.primary} accessibilityRole="button">
              <Text style={styles.primaryTxt}>Continue</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void finish()}
              style={styles.primary}
              accessibilityRole="button"
              accessibilityLabel="Finish onboarding"
            >
              <Text style={styles.primaryTxt}>Go to Today</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.legalSticky}>
          <Text style={styles.legalMuted} accessibilityRole="text">
            {"DeenNotes — "}
            <Text
              accessibilityRole="link"
              style={styles.legalLink}
              onPress={() => void Linking.openURL(getLegalTermsUrl()).catch(() => {})}
            >
              Terms
            </Text>
            <Text style={styles.legalMuted}> · </Text>
            <Text
              accessibilityRole="link"
              style={styles.legalLink}
              onPress={() => void Linking.openURL(getLegalPrivacyUrl()).catch(() => {})}
            >
              Privacy
            </Text>
          </Text>
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
    marginBottom: spacing.xs,
  },
  stepFoot: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontSerifHeading,
    fontSize: 28,
    fontWeight: "600",
    color: ink,
    marginBottom: spacing.sm,
  },
  prompt: {
    fontSize: fontSizes.md,
    color: emerald,
    fontStyle: "italic",
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22, marginBottom: spacing.lg },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chipHint: {
    width: "100%",
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    marginTop: -spacing.xs,
  },
  langChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
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
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  successCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.25)",
    backgroundColor: "rgba(18,122,99,0.08)",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  successTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: ink,
  },
  successBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
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
  legalSticky: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: border,
    alignItems: "center",
  },
  legalMuted: {
    fontSize: fontSizes.xs,
    color: muted,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  legalLink: {
    fontSize: fontSizes.xs,
    color: emerald,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
