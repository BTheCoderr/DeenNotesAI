import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDeenNotesList } from "../../src/api/hooks/useDeenNotes";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { SkeletonReflectList } from "../../src/components/skeleton/CalmSkeleton";
import { SettingsGearButton } from "../../src/components/settings/SettingsGearButton";
import { labelForNoteType } from "../../src/contracts/note-types";
import { SETTINGS_PROFILE_ROUTE } from "../../src/contracts/nav";
import { useMobileSession } from "../../src/hooks/useMobileSession";
import { usePremium } from "../../src/hooks/usePremium";
import { usePremiumFeatureFlags } from "../../src/hooks/usePremiumFeatureFlags";
import {
  readReflectionLibrary,
  type ReflectionLibraryItem,
} from "../../src/lib/reflection-library";
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

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function mapCloudToLibrary(
  rows: {
    id: string;
    title: string;
    note_type: string;
    created_at: string;
    short_summary?: string | null;
    main_reminder?: string | null;
  }[],
): ReflectionLibraryItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    short_summary: row.short_summary && row.short_summary.trim() ? row.short_summary : null,
    main_reminder: row.main_reminder && row.main_reminder.trim() ? row.main_reminder : null,
    note_type: row.note_type ?? null,
    created_at: row.created_at,
    source: "supabase" as const,
  }));
}

function ReflectScreenInner() {
  const router = useRouter();
  const auth = useMobileSession();
  const { isHydrated, openPaywall, purchasesAvailable, assertPremiumOrPaywall } = usePremium();
  const { canUseReflectionMemory } = usePremiumFeatureFlags();
  const hasSignedIn = Boolean(auth.ready && auth.accessToken);
  const cloudLibraryUnlocked = canUseReflectionMemory;

  const listQuery = useDeenNotesList(hasSignedIn && cloudLibraryUnlocked);
  const [localRows, setLocalRows] = useState<ReflectionLibraryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const reloadLocal = useCallback(() => {
    void readReflectionLibrary().then(setLocalRows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadLocal();
    }, [reloadLocal]),
  );

  const cloudRows = useMemo(() => {
    if (!listQuery.data) return [];
    return mapCloudToLibrary(listQuery.data);
  }, [listQuery.data]);

  const merged = useMemo((): ReflectionLibraryItem[] => {
    if (!hasSignedIn) return localRows;
    if (cloudLibraryUnlocked && !listQuery.isError && listQuery.data !== undefined) {
      const cloudIds = new Set(cloudRows.map((r) => r.id));
      const localsOnly = localRows.filter((r) => !cloudIds.has(r.id));
      return [...cloudRows, ...localsOnly].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return localRows;
  }, [hasSignedIn, cloudLibraryUnlocked, listQuery.isError, listQuery.data, cloudRows, localRows]);

  const recent = merged.slice(0, 3);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      reloadLocal();
      if (hasSignedIn && cloudLibraryUnlocked) await listQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [hasSignedIn, cloudLibraryUnlocked, listQuery, reloadLocal]);

  const showInitialCloudLoad =
    hasSignedIn &&
    cloudLibraryUnlocked &&
    listQuery.isPending &&
    localRows.length === 0 &&
    !listQuery.isError;

  function onRecordKhutbah() {
    if (!isHydrated) return;
    if (!assertPremiumOrPaywall("khutbah_recording")) return;
    router.push("/recording/session");
  }

  const showPlusLibraryBanner =
    hasSignedIn && purchasesAvailable && isHydrated && !canUseReflectionMemory;

  const listHeader =
    merged.length > 0 ? (
      <View style={styles.recentBlock}>
        <Text style={styles.sectionLabel}>Recent</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRow}
        >
          {recent.map((item) => (
            <Pressable
              key={`r-${item.id}`}
              style={styles.recentCard}
              onPress={() => router.push(`/notes/${item.id}`)}
            >
              <Ionicons name="journal-outline" size={18} color={emerald} style={styles.cardIconTop} />
              <Text style={styles.typePill}>
                {item.note_type ? labelForNoteType(item.note_type) : "Reflection"}
              </Text>
              <Text style={styles.recentTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.recentReminder} numberOfLines={2}>
                {item.main_reminder ?? item.short_summary ?? " "}
              </Text>
              <Text style={styles.recentMeta}>{formatDate(item.created_at)}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={[styles.sectionLabel, styles.libraryLabel]}>All reflections</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.topRow}>
        <Text style={styles.h1}>Reflect</Text>
        <SettingsGearButton href={SETTINGS_PROFILE_ROUTE} />
      </View>
      <Text style={styles.tagline}>Capture what moved you, then return to it with clarity.</Text>
      {!hasSignedIn ? (
        <Text style={styles.signInHint}>Sign in from Settings to sync reflections across visits.</Text>
      ) : !cloudLibraryUnlocked ? (
        <Text style={styles.signInHint}>
          On-device reflections stay with you. DeenNotes Plus mirrors your full signed-in library here.
        </Text>
      ) : (
        <Text style={styles.signInHint}>Your recent notes from this account appear below.</Text>
      )}

      {showPlusLibraryBanner ? (
        <Pressable
          onPress={() => openPaywall("reflect_cloud_sync")}
          style={styles.syncBanner}
          accessibilityRole="button"
        >
          <Text style={styles.syncBannerTitle}>Keep your full library in one place</Text>
          <Text style={styles.syncBannerBody}>
            DeenNotes Plus syncs your reflections calmly across visits — tap to learn more when you&apos;re ready.
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.heroPrimary}
        onPress={() => router.push("/new-sheet")}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={26} color="#fff" />
        <View style={styles.heroPrimaryTxt}>
          <Text style={styles.heroPrimaryTitle}>New reflection</Text>
          <Text style={styles.heroPrimarySub}>Capture a thought, verse, or reminder in your voice.</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" />
      </Pressable>

      <View style={styles.secondaryRow}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={onRecordKhutbah}
          accessibilityRole="button"
          accessibilityLabel="Record khutbah"
        >
          <Ionicons name="mic-outline" size={22} color={emerald} />
          <Text style={styles.secondaryBtnTxt}>Record khutbah</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/new-sheet")}
          accessibilityRole="button"
          accessibilityLabel="Choose a capture mode"
        >
          <Ionicons name="grid-outline" size={22} color={emerald} />
          <Text style={styles.secondaryBtnTxt}>Capture modes</Text>
        </Pressable>
      </View>

      <View style={styles.promoCard}>
        <Text style={styles.promoKicker}>Never lose a reflection</Text>
        <Text style={styles.promoBody}>
          Save thoughts, khutbah notes, and Qur&apos;an reflections in one calm place — unhurried, private-first.
        </Text>
        <Pressable
          style={styles.promoCta}
          onPress={() => router.push("/new-sheet")}
          accessibilityRole="button"
        >
          <Text style={styles.promoCtaTxt}>Start reflecting</Text>
        </Pressable>
      </View>

      {showInitialCloudLoad ? (
        <View style={styles.loadingBox} accessibilityRole="progressbar">
          <SkeletonReflectList />
          <Text style={styles.loadingTxt}>Gathering reflections at an unhurried pace…</Text>
        </View>
      ) : (
        <FlatList
          style={styles.listFlex}
          data={merged}
          keyExtractor={(item) => item.id}
          accessibilityLabel="Reflection list"
          refreshControl={
            <RefreshControl
              refreshing={refreshing || (hasSignedIn && cloudLibraryUnlocked && listQuery.isFetching)}
              onRefresh={() => void onRefresh()}
              tintColor={emerald}
            />
          }
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={32} color={emerald} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.emptyTitle}>A quiet shelf for now</Text>
              <Text style={styles.muted}>
                Start with a thought, a verse, a khutbah, or a moment you want to remember.
              </Text>
              <Pressable
                style={styles.cta}
                onPress={() => router.push("/new-sheet")}
                accessibilityRole="button"
              >
                <Text style={styles.ctaTxt}>Choose a capture mode</Text>
              </Pressable>
              {!hasSignedIn ? (
                <Pressable style={styles.ctaSecondary} onPress={() => router.push("/login")}>
                  <Text style={styles.ctaSecondaryTxt}>Sign in</Text>
                </Pressable>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/notes/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.cardTopRow}>
                <Ionicons name="document-text-outline" size={20} color={emerald} />
                <Text style={styles.cardType}>
                  {item.note_type ? labelForNoteType(item.note_type) : "Reflection"}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardReminder} numberOfLines={2}>
                {item.main_reminder ?? item.short_summary ?? " "}
              </Text>
              <View style={styles.cardFoot}>
                <Text style={styles.cardMeta}>{formatDate(item.created_at)}</Text>
                <Text style={styles.cardSrc}>
                  {item.source === "local" ? "On device" : "Cloud"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {hasSignedIn && listQuery.isError ? (
        <Text style={styles.banner}>
          Could not sync from the cloud — showing saved on-device placeholders. Pull down to retry.
        </Text>
      ) : null}
    </SafeAreaView>
  );
}

export default function ReflectScreen() {
  return (
    <ScreenErrorBoundary scope="reflect-tab">
      <ReflectScreenInner />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone, paddingHorizontal: spacing.xl },
  listFlex: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingTxt: { fontSize: fontSizes.sm, color: muted },
  banner: {
    fontSize: fontSizes.xs,
    color: "#b45309",
    paddingVertical: spacing.sm,
    textAlign: "center",
    lineHeight: 16,
  },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 28,
    fontWeight: "600",
    color: ink,
    flex: 1,
  },
  tagline: {
    fontSize: fontSizes.sm,
    color: ink,
    marginBottom: spacing.xs,
    lineHeight: 22,
    fontWeight: "600",
  },
  signInHint: { fontSize: fontSizes.sm, color: muted, marginBottom: spacing.md, lineHeight: 20 },
  syncBanner: {
    alignSelf: "stretch",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.08)",
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  syncBannerTitle: { fontSize: fontSizes.sm, fontWeight: "800", color: emerald },
  syncBannerBody: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  heroPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    alignSelf: "stretch",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.45)",
  },
  heroPrimaryTxt: { flex: 1, gap: 4 },
  heroPrimaryTitle: { color: "#fff", fontWeight: "800", fontSize: fontSizes.lg, fontFamily: fontSerifHeading },
  heroPrimarySub: { color: "rgba(255,255,255,0.92)", fontSize: fontSizes.sm, lineHeight: 20 },
  secondaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    minHeight: 52,
  },
  secondaryBtnTxt: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: ink,
    textAlign: "center",
    flexShrink: 1,
  },
  promoCard: {
    alignSelf: "stretch",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  promoKicker: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: ink,
  },
  promoBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  promoCta: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  promoCtaTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  recentBlock: { marginBottom: spacing.md },
  sectionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  libraryLabel: { marginTop: spacing.lg },
  recentRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  recentCard: {
    width: 228,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    gap: 6,
  },
  cardIconTop: { marginBottom: 2 },
  typePill: { fontSize: 10, fontWeight: "800", color: bronze, textTransform: "uppercase" },
  recentTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink, fontFamily: fontSerifHeading },
  recentReminder: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  recentMeta: { fontSize: fontSizes.xs, color: bronze, marginTop: spacing.xs },
  list: { paddingBottom: 120, flexGrow: 1, gap: spacing.xs },
  empty: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    gap: spacing.md,
    alignItems: "flex-start",
  },
  emptyTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: ink,
  },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  cta: {
    alignSelf: "stretch",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  ctaSecondary: { alignSelf: "flex-start", paddingVertical: spacing.sm },
  ctaSecondaryTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.md },
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    marginBottom: spacing.sm,
    gap: 6,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  cardType: { fontSize: 10, fontWeight: "800", color: bronze, textTransform: "uppercase" },
  cardTitle: { fontSize: fontSizes.md, fontWeight: "800", color: ink, fontFamily: fontSerifHeading },
  cardReminder: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  cardMeta: {
    fontSize: fontSizes.xs,
    color: bronze,
    fontVariant: ["tabular-nums"],
  },
  cardSrc: { fontSize: 10, color: muted, letterSpacing: 0.3 },
});
