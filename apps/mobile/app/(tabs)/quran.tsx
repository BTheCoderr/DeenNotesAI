import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChapters } from "../../src/api/hooks/useChapters";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { CalmPulseBlock } from "../../src/components/skeleton/CalmSkeleton";
import { useQuranPlayback } from "../../src/context/QuranPlaybackContext";
import {
  prefetchAyahWindow,
} from "../../src/lib/quran/audio-cache";
import {
  readContinueReading,
  type ContinueReadingState,
} from "../../src/lib/quran-continue-reading";
import { readMobileQuranPrefs } from "../../src/lib/mobile-quran-prefs";
import { offlineReflectionSubtitle } from "../../src/lib/quran-meta";
import { usePremium } from "../../src/hooks/usePremium";
import type { Chapter } from "../../src/api/types";
import { FALLBACK_MOBILE_RECITER_ID } from "../../src/api/quran";
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

function QuranSurahListScreen() {
  const router = useRouter();
  const { isPremium, purchasesAvailable } = usePremium();
  const offlineAudioPrefsUnlocked = !purchasesAvailable || isPremium;
  const { data, isLoading, error, isOfflineListFallback } = useChapters();
  const playback = useQuranPlayback();
  const playbackReserve = playback.hasActiveMiniStrip ? 132 : 0;

  const [q, setQ] = useState("");
  const [cont, setCont] = useState<ContinueReadingState | null>(null);

  const chapters = data?.chapters ?? [];
  const subtitle = offlineReflectionSubtitle(data?.meta ?? null);
  const hasChaptersList = chapters.length > 0;

  const reloadContinue = useCallback(() => {
    void readContinueReading().then(setCont);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadContinue();
    }, [reloadContinue]),
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const [reading, prefs] = await Promise.all([
          readContinueReading(),
          readMobileQuranPrefs(),
        ]);
        if (cancelled || !prefs.autoDownloadContinueSurah || !reading || !offlineAudioPrefsUnlocked) return;
        const rec = prefs.reciterId?.trim() || FALLBACK_MOBILE_RECITER_ID;
        const ys: number[] = [];
        const capAyah = Math.min(reading.ayah + 6, reading.ayah + 40);
        for (let ay = reading.ayah; ay < capAyah; ay++) {
          ys.push(ay);
          if (ys.length >= 6) break;
        }
        if (ys.length) {
          void prefetchAyahWindow(rec, reading.surahId, ys, {
            audioWifiOnly: prefs.audioWifiOnly ?? false,
            maxCacheMb: prefs.audioMaxCacheMb ?? 200,
          });
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [offlineAudioPrefsUnlocked]),
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return chapters;
    return chapters.filter(
      (c) =>
        c.nameSimple.toLowerCase().includes(s) ||
        c.nameArabic.includes(q) ||
        (c.translatedName && c.translatedName.toLowerCase().includes(s)),
    );
  }, [chapters, q]);

  const contSurahName = useMemo(() => {
    if (!cont) return null;
    return chapters.find((c) => c.id === cont.surahId)?.nameSimple ?? `Surah ${cont.surahId}`;
  }, [chapters, cont]);

  const listBottomPad = Math.max(120, 120 + playbackReserve);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.topRow}>
        <Text style={styles.h1}>Quran</Text>
        <Pressable onPress={() => router.push("/quran/settings")} style={styles.settingsLink}>
          <Text style={styles.settingsTxt}>Settings</Text>
        </Pressable>
      </View>
      {subtitle ? <Text style={styles.note}>{subtitle}</Text> : null}
      {isOfflineListFallback ? (
        <Text style={styles.offlineRibbon}>
          Showing the last memorised surah index from this phone — soften your pace until the network returns.
        </Text>
      ) : null}

      {cont ? (
        <Pressable
          style={styles.contCard}
          onPress={() => router.push(`/quran/${cont.surahId}`)}
        >
          <Text style={styles.contK}>Continue reading</Text>
          <Text style={styles.contTitle}>
            {contSurahName} · Ayah {cont.ayah}
          </Text>
          <Text style={styles.contSub}>Return gently to where you paused.</Text>
        </Pressable>
      ) : (
        <View style={styles.contPlaceholder}>
          <Text style={styles.contMuted}>
            Continue-reading stays on your device — open any surah to leave a breadcrumb ayah-by-ayah as you tap.
          </Text>
        </View>
      )}

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search surah"
        placeholderTextColor={muted}
        style={styles.search}
      />

      {isLoading && !hasChaptersList ? (
        <View style={styles.center} accessibilityRole="progressbar">
          <CalmPulseBlock height={56} accessibilityLabel="Surah list placeholder" />
          <CalmPulseBlock height={12} style={{ width: "88%", marginTop: spacing.md }} />
          <CalmPulseBlock height={12} style={{ width: "72%", marginTop: spacing.sm }} />
          <Text style={styles.loadHint}>Letting the surah index settle into place…</Text>
        </View>
      ) : error && !hasChaptersList ? (
        <View style={styles.calmOffline}>
          <Text style={styles.calmOfflineTitle}>The surah catalogue is resting</Text>
          <Text style={styles.calmOfflineBody}>
            When you reconnect, we refresh gently. Until then there is quiet — try later with a gracious heart.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={[styles.list, { paddingBottom: listBottomPad }]}
          renderItem={({ item }) => (
            <SurahRow chapter={item} onPress={() => router.push(`/quran/${item.id}`)} />
          )}
          ListEmptyComponent={
            q.trim().length > 0 ? (
              <Text style={styles.contMuted}>No surahs match search.</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

export default function QuranSurahListScreenExported() {
  return (
    <ScreenErrorBoundary scope="quran-tab">
      <QuranSurahListScreen />
    </ScreenErrorBoundary>
  );
}

function SurahRow({ chapter, onPress }: { chapter: Chapter; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.rowInner}>
        <Text style={styles.num}>{chapter.id}</Text>
        <View style={styles.rowText}>
          <Text style={styles.nameEn}>{chapter.nameSimple}</Text>
          {chapter.translatedName ? (
            <Text style={styles.sub}>{chapter.translatedName}</Text>
          ) : null}
        </View>
        <Text style={styles.ar}>{chapter.nameArabic}</Text>
      </View>
      <Text style={styles.vc}>{chapter.versesCount} āyāt</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone, paddingHorizontal: spacing.xl },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 28,
    fontWeight: "600",
    color: ink,
  },
  settingsLink: { paddingVertical: 8, paddingHorizontal: 4 },
  settingsTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.sm },
  note: { fontSize: fontSizes.xs, color: muted, marginBottom: spacing.sm, lineHeight: 18 },
  offlineRibbon: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    marginBottom: spacing.md,
    fontStyle: "italic",
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: emerald,
  },
  contCard: {
    backgroundColor: cardBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  contK: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: emerald,
    letterSpacing: 0.5,
  },
  contTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  contSub: { fontSize: fontSizes.sm, color: muted },
  contPlaceholder: { marginBottom: spacing.md },
  contMuted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  search: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSizes.md,
    color: ink,
    marginBottom: spacing.md,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  center: { paddingVertical: 40, alignItems: "center" },
  loadHint: { marginTop: spacing.md, fontSize: fontSizes.sm, color: muted, textAlign: "center" },
  calmOffline: { gap: spacing.sm, marginBottom: spacing.md },
  calmOfflineTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: bronze,
  },
  calmOfflineBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 21 },
  list: {},
  row: {
    backgroundColor: cardBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowInner: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  num: {
    width: 28,
    fontSize: fontSizes.sm,
    fontWeight: "800",
    color: emerald,
    fontVariant: ["tabular-nums"],
  },
  rowText: { flex: 1, minWidth: 0 },
  nameEn: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  sub: { fontSize: fontSizes.xs, color: muted },
  ar: { fontSize: fontSizes.lg, color: ink },
  vc: { fontSize: fontSizes.xs, color: muted, marginTop: 6 },
});
