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
import { labelForNoteType } from "../../src/contracts/note-types";
import { SETTINGS_PROFILE_ROUTE } from "../../src/contracts/nav";
import { useMobileSession } from "../../src/hooks/useMobileSession";
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
  const hasSignedIn = Boolean(auth.ready && auth.accessToken);

  const listQuery = useDeenNotesList(hasSignedIn);
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
    if (hasSignedIn && !listQuery.isError && listQuery.data !== undefined) {
      return cloudRows;
    }
    return localRows;
  }, [hasSignedIn, listQuery.isError, listQuery.data, cloudRows, localRows]);

  const recent = merged.slice(0, 3);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      reloadLocal();
      if (hasSignedIn) await listQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [hasSignedIn, listQuery, reloadLocal]);

  const showInitialCloudLoad =
    hasSignedIn && listQuery.isPending && localRows.length === 0 && !listQuery.isError;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.topRow}>
        <Text style={styles.h1}>Reflect</Text>
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
      <Text style={styles.sub}>
        {hasSignedIn
          ? "Reflections from your account — same notes as the web app."
          : "Signed-out view shows on-device placeholders. Sign in from Settings to load your library."}
      </Text>

      <Pressable
        style={styles.newBtn}
        onPress={() => router.push("/new-sheet")}
        accessibilityRole="button"
      >
        <Text style={styles.newBtnTxt}>New reflection</Text>
      </Pressable>

      {showInitialCloudLoad ? (
        <View style={styles.loadingBox} accessibilityRole="progressbar">
          <SkeletonReflectList />
          <Text style={styles.loadingTxt}>Gathering reflections at an unhurried pace…</Text>
        </View>
      ) : (
        <FlatList
          data={merged}
          keyExtractor={(item) => item.id}
          accessibilityLabel="Reflection list"
          refreshControl={
            <RefreshControl
              refreshing={refreshing || (hasSignedIn && listQuery.isFetching)}
              onRefresh={() => void onRefresh()}
              tintColor={emerald}
            />
          }
          ListHeaderComponent={
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
            ) : null
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>A quiet shelf for now</Text>
              <Text style={styles.muted}>
                {hasSignedIn
                  ? "Tap New reflection to capture something sincere — entries stay here whenever you return."
                  : "Sign in once to mirror notes from your account. Until then this list stays softly empty."}
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
              <Text style={styles.cardType}>
                {item.note_type ? labelForNoteType(item.note_type) : "Reflection"}
              </Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardReminder} numberOfLines={2}>
                {item.main_reminder ?? item.short_summary ?? " "}
              </Text>
              <Text style={styles.cardMeta}>{formatDate(item.created_at)}</Text>
              <Text style={styles.cardSrc}>
                {item.source === "local" ? "On device" : "Cloud"}
              </Text>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  settingsIconBtn: { padding: 4 },
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
    marginBottom: spacing.xs,
  },
  sub: { fontSize: fontSizes.sm, color: muted, marginBottom: spacing.md, lineHeight: 20 },
  newBtn: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  newBtnTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
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
    width: 220,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    gap: 4,
  },
  typePill: { fontSize: 10, fontWeight: "800", color: bronze, textTransform: "uppercase" },
  recentTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  recentReminder: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  recentMeta: { fontSize: fontSizes.xs, color: bronze, marginTop: spacing.xs },
  list: { paddingBottom: 120, flexGrow: 1 },
  empty: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: ink,
  },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 52,
    justifyContent: "center",
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  ctaSecondary: { alignSelf: "flex-start", paddingVertical: spacing.sm },
  ctaSecondaryTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.md },
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    marginBottom: spacing.sm,
    gap: 4,
  },
  cardType: { fontSize: 10, fontWeight: "800", color: bronze, textTransform: "uppercase" },
  cardTitle: { fontSize: fontSizes.md, fontWeight: "800", color: ink },
  cardReminder: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  cardMeta: {
    fontSize: fontSizes.xs,
    color: bronze,
    fontVariant: ["tabular-nums"],
    marginTop: 4,
  },
  cardSrc: { fontSize: 10, color: muted, letterSpacing: 0.3 },
});
