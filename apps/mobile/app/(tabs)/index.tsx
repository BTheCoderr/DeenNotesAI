import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { usePrayerToday } from "../../src/api/hooks/usePrayerToday";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { SkeletonHeroCard } from "../../src/components/skeleton/CalmSkeleton";
import { SalahPlannerEntryCard } from "../../src/components/salah-planner/SalahPlannerEntryCard";
import { ContinueReadingCard } from "../../src/components/today/ContinueReadingCard";
import { DailyAyahCard } from "../../src/components/today/DailyAyahCard";
import { JourneyWeekStrip } from "../../src/components/today/JourneyWeekStrip";
import { QuietReflectionSection } from "../../src/components/today/QuietReflectionSection";
import { TodayPrayerHero } from "../../src/components/today/TodayPrayerHero";
import { NextPrayerCard } from "../../src/components/prayer/NextPrayerCard";
import { SettingsGearButton } from "../../src/components/settings/SettingsGearButton";
import { SETTINGS_PROFILE_ROUTE } from "../../src/contracts/nav";
import { DEENNOTES_SAFETY_DISCLAIMER } from "../../src/contracts/safety-copy";
import { readJourneyStreak } from "../../src/lib/continuity-storage";
import { readLearningMode } from "../../src/lib/learning-mode-storage";
import { readSalahPlannerCompletionSummary } from "../../src/lib/salah-planner-storage";
import {
  readContinueReading,
  type ContinueReadingState,
} from "../../src/lib/quran-continue-reading";
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
} from "../../src/theme";

const ONBOARDING_DONE_KEY = "deennotes.mobile.onboarding.v1";

const QUIET_LINES = [
  "Let your next step be small and sincere.",
  "Quiet moments shape lasting habits.",
  "Return to remembrance without rushing.",
];

export default function TodayScreen() {
  return (
    <ScreenErrorBoundary scope="today">
      <TodayScreenInner />
    </ScreenErrorBoundary>
  );
}

function TodayScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch, isRefetching } = usePrayerToday();
  const [, setTick] = useState(0);
  const [continueReading, setContinueReading] = useState<ContinueReadingState | null>(
    null,
  );
  const [streak, setStreak] = useState(0);
  const [weekRev, setWeekRev] = useState(0);
  const [plannerDone, setPlannerDone] = useState(0);
  const [plannerTotal, setPlannerTotal] = useState(0);
  const [learningMode, setLearningMode] = useState(false);

  const quietLine =
    QUIET_LINES[Math.floor(Date.now() / 60_000) % QUIET_LINES.length];

  useFocusEffect(
    useCallback(() => {
      setWeekRev((n) => n + 1);
      void readJourneyStreak().then(setStreak);
      void readSalahPlannerCompletionSummary().then(({ done, total }) => {
        setPlannerDone(done);
        setPlannerTotal(total);
      });
      void readLearningMode().then((lm) => setLearningMode(lm.enabled));
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      void readContinueReading().then(setContinueReading);
    }, []),
  );

  useEffect(() => {
    void AsyncStorage.getItem(ONBOARDING_DONE_KEY).then((v) => {
      if (v !== "1") {
        router.replace("/onboarding");
      }
    });
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const nextMs =
    data && "ok" in data && data.ok && data.schedule.nextAtEpochMs
      ? data.schedule.nextAtEpochMs - Date.now()
      : null;

  const prayerOk = Boolean(data && "ok" in data && data.ok);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 28) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={emerald}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.h1}>Today&apos;s Journey</Text>
          <View style={styles.headerRight}>
            <View style={styles.streakPill} accessibilityLabel={`Journey streak ${streak} days`}>
              <Ionicons name="flame" size={18} color={bronze} />
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
            <SettingsGearButton href={SETTINGS_PROFILE_ROUTE} />
          </View>
        </View>

        <JourneyWeekStrip revision={weekRev} />

        <DailyAyahCard />

        <SalahPlannerEntryCard
          completed={plannerDone}
          total={plannerTotal}
          learningMode={learningMode}
        />

        <QuietReflectionSection promptLine={quietLine} />

        {isLoading ? (
          <View style={styles.prayerSlot} accessibilityRole="progressbar">
            <SkeletonHeroCard lines={3} />
            <Text style={styles.loadingHint}>Gathering salah times for your rhythm…</Text>
          </View>
        ) : error || !data || !("ok" in data) || !data.ok ? (
          <View style={styles.prayerFallback}>
            <Text style={styles.errorTitle}>Next salah</Text>
            <Text style={styles.muted}>
              Prayer times need a quick online check. Pull to refresh after you reconnect, or tune city in
              Settings → Prayer Preferences.
            </Text>
            {__DEV__ && data && "ok" in data && !data.ok && typeof (data as { error?: string }).error === "string" ? (
              <Text style={styles.devErr}>{(data as { error: string }).error}</Text>
            ) : null}
            {__DEV__ && error instanceof Error ? (
              <Text style={styles.devErr}>{error.message}</Text>
            ) : null}
            <Pressable
              onPress={() => void refetch()}
              style={styles.btn}
              accessibilityRole="button"
              accessibilityLabel="Retry loading prayer times"
            >
              <Text style={styles.btnTxt}>{isRefetching ? "Refreshing…" : "Retry"}</Text>
            </Pressable>
          </View>
        ) : (
          <TodayPrayerHero data={data} nextCountdownMs={nextMs} />
        )}

        {prayerOk ? (
          <NextPrayerCard
            showFallback={false}
            data={
              data && "ok" in data && data.ok
                ? data
                : undefined
            }
            onManageReminders={() => router.push("/(tabs)/prayer")}
          />
        ) : null}

        {prayerOk ? (
          <Text style={styles.pullHint}>
            Pull gently to refresh when you travel or reconnect.
          </Text>
        ) : null}

        <ContinueReadingCard state={continueReading} />

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTxt}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(184,134,11,0.14)",
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.35)",
  },
  streakNum: { fontSize: fontSizes.md, fontWeight: "800", color: ink, minWidth: 18 },
  h1: {
    flex: 1,
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xxl,
    fontWeight: "600",
    color: ink,
  },
  prayerSlot: { paddingVertical: spacing.sm, alignItems: "stretch", gap: spacing.sm },
  loadingHint: {
    fontSize: fontSizes.sm,
    color: muted,
    textAlign: "center",
    lineHeight: 20,
  },
  prayerFallback: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  devErr: { fontSize: fontSizes.xs, color: "#8b2942", marginTop: 4 },
  errorTitle: { fontSize: fontSizes.lg, fontWeight: "700", color: ink },
  btn: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "700" },
  pullHint: {
    fontSize: fontSizes.sm,
    color: muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  disclaimer: { paddingVertical: spacing.md },
  disclaimerTxt: {
    fontSize: fontSizes.xs,
    color: muted,
    lineHeight: 18,
    textAlign: "center",
  },
});
