import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { usePrayerToday } from "../../src/api/hooks/usePrayerToday";
import { SETTINGS_PROFILE_ROUTE } from "../../src/contracts/nav";
import { DEENNOTES_SAFETY_DISCLAIMER } from "../../src/contracts/safety-copy";
import { border, bronze, cardBg, emerald, fontSizes, ink, muted, radii, spacing, stone } from "../../src/theme";

const ONBOARDING_DONE_KEY = "deennotes.mobile.onboarding.v1";

const QUIET_LINES = [
  "Let your next step be small and sincere.",
  "Quiet moments shape lasting habits.",
  "Return to remembrance without rushing.",
];

function formatCountdown(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  if (ms <= 0) return "Now";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

export default function TodayScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = usePrayerToday();
  const [tick, setTick] = useState(0);
  const quietLine = useMemo(
    () => QUIET_LINES[Math.floor(Date.now() / 60_000) % QUIET_LINES.length],
    [tick],
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
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
          <Text style={styles.h1}>Today</Text>
          <Link href={SETTINGS_PROFILE_ROUTE} style={styles.settingsLink}>
            Settings
          </Link>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={emerald} />
          </View>
        ) : error ||
          !data ||
          !("ok" in data) ||
          !data.ok ? (
          <View style={styles.card}>
            <Text style={styles.errorTitle}>Couldn’t load prayer rhythm</Text>
            <Text style={styles.muted}>
              {error instanceof Error
                ? error.message
                : data && "ok" in data && !data.ok
                  ? data.error
                  : "Pull down to refresh after checking network."}
            </Text>
            <Pressable onPress={() => void refetch()} style={styles.btn}>
              <Text style={styles.btnTxt}>{isRefetching ? "Loading…" : "Retry"}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>Next prayer</Text>
              <Text style={styles.heroPrayer}>{data.schedule.nextPrayer}</Text>
              <Text style={styles.countdown}>{formatCountdown(nextMs)}</Text>
              <Text style={styles.hijri}>{data.hijriLabel}</Text>
              <Text style={styles.subtle}>
                {data.gregorianDateReadable}
                {data.timezone ? ` · ${data.timezone}` : ""}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.eyebrow}>Today’s ayah</Text>
              <Text style={styles.muted}>
                A gentle ayah line will appear here once the reader is connected.
              </Text>
              <Link href="/quran/1" asChild>
                <Pressable style={styles.linkBtn}>
                  <Text style={styles.linkBtnTxt}>Continue in Quran</Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.card}>
              <Text style={styles.eyebrow}>Continue reading</Text>
              <Text style={styles.muted}>
                Your last surah position will sync when reading history is wired.
              </Text>
              <Pressable
                onPress={() => router.push("/quran/1")}
                style={styles.linkBtnSecondary}
              >
                  <Text style={styles.linkBtnTxtSec}>Open Quran</Text>
                </Pressable>
            </View>

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

            <View style={[styles.card, styles.quiet]}>
              <Text style={styles.quietLabel}>Quiet prompt</Text>
              <Text style={styles.quietText}>{quietLine}</Text>
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTxt}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.md },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  h1: { fontSize: fontSizes.xxl, fontWeight: "700", color: ink },
  settingsLink: { color: emerald, fontWeight: "700", fontSize: fontSizes.sm },
  center: { paddingVertical: 48, alignItems: "center" },
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
  heroPrayer: { fontSize: fontSizes.xxl, fontWeight: "800", color: emerald },
  countdown: { fontSize: fontSizes.xl, fontVariant: ["tabular-nums"], color: ink },
  hijri: { fontSize: fontSizes.md, color: ink, fontWeight: "600" },
  subtle: { fontSize: fontSizes.sm, color: muted },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  errorTitle: { fontSize: fontSizes.lg, fontWeight: "700", color: ink },
  btn: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  btnTxt: { color: "#fff", fontWeight: "700" },
  linkBtn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  linkBtnTxt: { color: "#fff", fontWeight: "700", fontSize: fontSizes.md },
  linkBtnSecondary: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  linkBtnTxtSec: { color: emerald, fontWeight: "700", fontSize: fontSizes.md },
  quiet: { backgroundColor: "rgba(184,134,11,0.08)" },
  quietLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  quietText: { fontSize: fontSizes.md, color: ink, lineHeight: 22, fontStyle: "italic" },
  disclaimer: { paddingVertical: spacing.md },
  disclaimerTxt: { fontSize: fontSizes.xs, color: muted, lineHeight: 18, textAlign: "center" },
});
