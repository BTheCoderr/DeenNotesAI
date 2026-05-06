import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { MobileWordmark } from "../../src/components/brand/MobileWordmark";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { SkeletonHeroCard } from "../../src/components/skeleton/CalmSkeleton";
import { ContinueReadingCard } from "../../src/components/today/ContinueReadingCard";
import { DailyAyahCard } from "../../src/components/today/DailyAyahCard";
import { DayContextCards } from "../../src/components/today/DayContextCards";
import { QuietReflectionSection } from "../../src/components/today/QuietReflectionSection";
import { TodayPrayerHero } from "../../src/components/today/TodayPrayerHero";
import { SETTINGS_PROFILE_ROUTE } from "../../src/contracts/nav";
import { DEENNOTES_SAFETY_DISCLAIMER } from "../../src/contracts/safety-copy";
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
  const [tick, setTick] = useState(0);
  const [continueReading, setContinueReading] = useState<ContinueReadingState | null>(
    null,
  );

  const quietLine = useMemo(
    () => QUIET_LINES[Math.floor(Date.now() / 60_000) % QUIET_LINES.length],
    [tick],
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

  const nextMs = useMemo(() => {
    if (!data || !("ok" in data) || !data.ok || !data.schedule.nextAtEpochMs)
      return null;
    return data.schedule.nextAtEpochMs - Date.now();
  }, [data, tick]);

  const isFriday = new Date().getDay() === 5;
  const showRamadanCard =
    Boolean(data && "ok" in data && data.ok && data.isRamadanDay);

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
          <View style={styles.headerLeft}>
            <MobileWordmark height={22} style={{ alignSelf: "flex-start", marginBottom: 4 }} />
            <Text style={styles.h1}>Today</Text>
          </View>
          <Pressable
            onPress={() => router.push(SETTINGS_PROFILE_ROUTE)}
            style={styles.settingsIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={24} color={emerald} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.center} accessibilityRole="progressbar">
            <SkeletonHeroCard lines={3} />
            <Text style={styles.loadingHint}>Arranging today&apos;s salah cadence with tenderness…</Text>
          </View>
        ) : error ||
          !data ||
          !("ok" in data) ||
          !data.ok ? (
          <View style={styles.card}>
            <Text style={styles.errorTitle}>Prayer rhythm is resting</Text>
            <Text style={styles.muted}>
              Pull down softly to try again once your connection settles. Prayer itself is untouched —
              only these timings need an online handshake.
            </Text>
            <Text style={styles.muted}>
              If this keeps happening, open Prayer → Settings and confirm city or device location.
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
              accessibilityLabel="Retry loading Today"
            >
              <Text style={styles.btnTxt}>
                {isRefetching ? "Refreshing…" : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TodayPrayerHero data={data} nextCountdownMs={nextMs} />

            <Text style={styles.pullHint}>
              Pull gently to refresh timings when you change location or reconnect.
            </Text>

            <QuietReflectionSection promptLine={quietLine} />

            <ContinueReadingCard state={continueReading} />

            <DailyAyahCard />

            <DayContextCards
              showFriday={isFriday}
              showRamadan={showRamadanCard}
              ramadanDay={data.ramadanDay ?? null}
            />

            <View style={styles.card}>
              <Text style={styles.eyebrow}>Recent reflection</Text>
              <Text style={styles.muted}>
                Your reflections will appear here once notes are connected.
              </Text>
              <Pressable
                onPress={() => router.push("/reflect")}
                style={styles.linkBtnSecondary}
              >
                <Text style={styles.linkBtnTxtSec}>Open Reflect</Text>
              </Pressable>
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTxt}>
                {DEENNOTES_SAFETY_DISCLAIMER}
              </Text>
            </View>
          </>
        )}
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
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  headerLeft: { flex: 1, gap: 2, marginRight: spacing.md },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xxl,
    fontWeight: "600",
    color: ink,
  },
  settingsIconBtn: { padding: 4 },
  center: { paddingVertical: 48, alignItems: "center", gap: spacing.md },
  loadingHint: {
    fontSize: fontSizes.sm,
    color: muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
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
  linkBtnSecondary: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  linkBtnTxtSec: { color: emerald, fontWeight: "700", fontSize: fontSizes.md },
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
