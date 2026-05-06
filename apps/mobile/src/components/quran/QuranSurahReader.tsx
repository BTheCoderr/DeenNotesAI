import { useNavigation, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Chapter, ChapterVersesResponse, VerseDto } from "../../api/types";
import { useQuranPlayback } from "../../context/QuranPlaybackContext";
import { estimateJuz } from "../../lib/quran/juz-meta";
import { cacheVerseAudioIfNeeded, prefetchAyahWindow } from "../../lib/quran/audio-cache";
import type { QuranPreferenceContract } from "../../contracts/quran-preferences";
import { writeContinueReading } from "../../lib/quran-continue-reading";
import { readMobileQuranPrefs } from "../../lib/mobile-quran-prefs";
import { safeBack } from "../../lib/navigation/safe-back";
import { CalmPulseBlock } from "../skeleton/CalmSkeleton";
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
} from "../../theme";

type Props = {
  chapterId: number;
  chapterMeta: Chapter | null;
  effectivePayload: ChapterVersesResponse | null;
  versesPending: boolean;
  versesHadError: boolean;
  hadCachedVersesFile: boolean;
  initialResumeAyah: number | null;
  showOfflineRibbon: boolean;
  /** Surah prefetch + explicit save bundles (RevenueCat). */
  offlineAudioUnlocked: boolean;
  onRequestOfflineAudioPremium: () => void;
};

/** Scroll + verse UI for one surah. Immersion, prefetch, playback controls. Auto-scroll anchor prep: refs on ScrollView — parent passes initialResumeAyah. */
export function QuranSurahReader({
  chapterId,
  chapterMeta,
  effectivePayload,
  versesPending,
  versesHadError,
  hadCachedVersesFile,
  initialResumeAyah,
  showOfflineRibbon,
  offlineAudioUnlocked,
  onRequestOfflineAudioPremium,
}: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;

  const [prefs, setPrefs] = useState<QuranPreferenceContract | null>(null);
  const [translationsRevealed, setTranslationsRevealed] = useState(true);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const { playVerse, reciterIdEffective } = useQuranPlayback();

  useEffect(() => {
    void readMobileQuranPrefs().then(setPrefs);
  }, []);

  const immersive = Boolean(prefs?.immersiveReading);
  const wifiOnly = prefs?.audioWifiOnly ?? false;
  const maxMb = prefs?.audioMaxCacheMb ?? 200;
  const reciter = (prefs?.reciterId?.trim() || reciterIdEffective) as string;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: !immersive });
  }, [immersive, navigation]);

  useEffect(() => {
    if (immersive) setTranslationsRevealed(false);
    else setTranslationsRevealed(true);
  }, [immersive]);

  const verseCount = effectivePayload?.verses?.length ?? 0;
  const resumeAyah = useMemo(() => {
    if (!effectivePayload?.verses?.length) return null;
    const max = effectivePayload.verses.length;
    const raw = initialResumeAyah ?? 1;
    return Math.max(1, Math.min(max, raw));
  }, [effectivePayload?.verses, initialResumeAyah]);

  const resetHeaderHide = useCallback(() => {
    headerOpacity.setValue(1);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!immersive) return;
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(headerOpacity, {
        toValue: 0.2,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2600);
  }, [headerOpacity, immersive]);

  useEffect(() => {
    resetHeaderHide();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHeaderHide]);

  const onScroll = useCallback(
    (_e: NativeSyntheticEvent<NativeScrollEvent>) => {
      resetHeaderHide();
    },
    [resetHeaderHide],
  );

  useEffect(() => {
    if (!offlineAudioUnlocked || !chapterId || !effectivePayload?.verses?.length || !prefs) return;
    const pivot = resumeAyah ?? 1;
    const list: number[] = [];
    for (let d = -2; d <= 2; d++) {
      const a = pivot + d;
      if (a >= 1 && a <= verseCount) list.push(a);
    }
    void prefetchAyahWindow(reciter, chapterId, list, {
      audioWifiOnly: prefs.audioWifiOnly ?? false,
      maxCacheMb: prefs.audioMaxCacheMb ?? 200,
    });
  }, [
    offlineAudioUnlocked,
    chapterId,
    effectivePayload?.verses?.length,
    prefs,
    reciter,
    resumeAyah,
    verseCount,
  ]);

  async function onDownloadSurahAudio() {
    if (!offlineAudioUnlocked) {
      onRequestOfflineAudioPremium();
      return;
    }
    if (!effectivePayload?.verses?.length || !prefs || downloadBusy) return;
    setDownloadBusy(true);
    try {
      for (const v of effectivePayload.verses) {
        await cacheVerseAudioIfNeeded({
          reciterId: reciter,
          surah: chapterId,
          ayah: v.verseNumber,
          audioWifiOnly: wifiOnly,
          maxCacheMb: maxMb,
        });
        await new Promise((r) => setTimeout(r, 50));
      }
    } finally {
      setDownloadBusy(false);
    }
  }

  const approxJuz = resumeAyah != null ? estimateJuz(chapterId, resumeAyah) : null;

  if (!effectivePayload?.verses?.length) {
    if (versesPending) {
      return (
        <SafeAreaView style={styles.safe} edges={immersive ? ["left", "right"] : ["bottom", "left", "right"]}>
          <View style={styles.pad}>
            <Text style={styles.h1}>{chapterMeta?.nameSimple ?? `Surah ${chapterId}`}</Text>
            <CalmPulseBlock height={72} accessibilityLabel="Verses assembling" style={{ marginTop: spacing.xl }} />
            <CalmPulseBlock height={14} style={{ width: "52%", marginTop: spacing.sm }} />
            <Text style={[styles.bodyMuted, { marginTop: spacing.md }]}>Unfolding verses thoughtfully…</Text>
          </View>
        </SafeAreaView>
      );
    }

    const calmOffline = versesHadError && !hadCachedVersesFile;

    return (
      <SafeAreaView style={styles.safe} edges={immersive ? ["left", "right"] : ["bottom", "left", "right"]}>
        <View style={styles.pad}>
          <Text style={styles.h1}>{chapterMeta?.nameSimple ?? `Surah ${chapterId}`}</Text>
          <Text style={styles.bodyMuted}>
            {calmOffline
              ? "This surah isn’t saved on your phone yet — open once when you have calm connection, and we will keep a reverent offline copy nearby."
              : "No verses to show yet."}
          </Text>
          <Pressable onPress={() => safeBack(router, navigation, "/(tabs)/quran")} style={styles.back}>
            <Text style={styles.backTxt}>Back to list</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderVerse = (v: VerseDto, index: number) => (
    <View key={v.verseKey} collapsable={false}>
      <Pressable
        onPress={() => {
          void writeContinueReading({ surahId: chapterId, ayah: v.verseNumber });
          void Animated.spring(headerOpacity, { toValue: 1, useNativeDriver: true }).start();
        }}
        style={({ pressed }) => [
          immersive ? styles.verseCardMinimal : styles.verseCard,
          pressed && { opacity: 0.96 },
        ]}
      >
        <Text style={immersive ? styles.ayahNumDim : styles.ayahNum}>
          {chapterId}:{v.verseNumber}
        </Text>
        <Text
          style={[styles.uth, immersive ? styles.uthImmersive : null, styles.arabicWrap]}
          maxFontSizeMultiplier={immersive ? 1.35 : undefined}
        >
          {v.textUthmani}
        </Text>
        <View style={{ opacity: translationsRevealed ? 1 : immersive ? 0.22 : 1 }}>
          {v.translations[0]?.text ? (
            <Text
              style={immersive ? styles.transImmersive : styles.trans}
              maxFontSizeMultiplier={1.2}
            >
              {v.translations[0].text}
            </Text>
          ) : (
            <Text style={styles.transMuted}>
              Translation follows your server defaults; tune language in Quran settings.
            </Text>
          )}
        </View>
        <View style={styles.rowActions}>
          <Pressable
            style={styles.playAyah}
            onPress={() =>
              void playVerse({
                surahId: chapterId,
                ayah: v.verseNumber,
                verseCount,
                reciterId: reciter,
                chapterTitle: chapterMeta?.nameSimple,
              })
            }
          >
            <Text style={styles.playAyahTxt}>Listen</Text>
          </Pressable>
        </View>
      </Pressable>
      {index < effectivePayload.verses.length - 1 && immersive ? <View style={styles.verseSpacer} /> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={immersive ? ["left", "right"] : ["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.pad,
          immersive && { paddingTop: spacing.lg, paddingHorizontal: spacing.lg + 4 },
          { paddingBottom: 160 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        <Animated.View style={{ opacity: headerOpacity }}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => safeBack(router, navigation, "/(tabs)/quran")} style={styles.backGhost}>
              <Text style={styles.backGhostTxt}>← Back</Text>
            </Pressable>
            {immersive ? (
              <Pressable onPress={() => setTranslationsRevealed((t) => !t)}>
                <Text style={styles.toggleHint}>{translationsRevealed ? "Calm Arabic" : "Show translation"}</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={immersive ? styles.h1Immersive : styles.h1}>
            {chapterMeta?.nameSimple ?? `Surah ${chapterId}`}
          </Text>
          {chapterMeta?.translatedName ? (
            <Text style={styles.sub}>{chapterMeta.translatedName}</Text>
          ) : null}
          <Text style={immersive ? styles.arImmersive : styles.ar}>{chapterMeta?.nameArabic}</Text>
          {approxJuz != null ? (
            <Text style={styles.juzHint}>Approx. Juz {approxJuz} — for Ramadan continuity later.</Text>
          ) : null}
        </Animated.View>

        <View style={styles.toolRow}>
          <Pressable
            style={[styles.toolBtn, downloadBusy && { opacity: 0.6 }]}
            onPress={() => void onDownloadSurahAudio()}
            disabled={downloadBusy}
          >
            <Text style={styles.toolBtnTxt}>
              {offlineAudioUnlocked
                ? downloadBusy
                  ? "Preparing audio…"
                  : "Save surah audio"
                : "Save surah audio (Plus)"}
            </Text>
          </Pressable>
          <Text style={styles.toolRowHelper}>
            {offlineAudioUnlocked
              ? "Keeps listening ready on this phone when data is steadier — nothing leaves the device unless you share it later."
              : "Offline verse bundles unlock with DeenNotes Plus — listening while online stays open."}
          </Text>
          {wifiOnly ? <Text style={styles.wifiNote}>Wi‑Fi only downloads are on in settings.</Text> : null}
        </View>

        <View style={styles.verses}>
          {showOfflineRibbon ? (
            <Text style={styles.offlineRibbon}>
              {versesHadError
                ? "Offline copy from this device — tune language when you are back online."
                : "Updating… meanwhile here is what we kept on this phone."}
            </Text>
          ) : null}
          {effectivePayload.verses.map((v, i) => renderVerse(v, i))}
        </View>

        <Pressable onPress={() => safeBack(router, navigation, "/(tabs)/quran")} style={styles.back}>
          <Text style={styles.backTxt}>Back to list</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { padding: spacing.xl, paddingBottom: 48, gap: spacing.md },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 26,
    fontWeight: "600",
    color: ink,
  },
  h1Immersive: {
    fontFamily: fontSerifHeading,
    fontSize: 22,
    fontWeight: "500",
    color: muted,
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  backGhost: { paddingVertical: 6 },
  backGhostTxt: { fontSize: fontSizes.sm, color: emerald, fontWeight: "700" },
  toggleHint: { fontSize: fontSizes.xs, color: bronze, fontWeight: "700" },
  sub: { fontSize: fontSizes.sm, color: muted },
  ar: { fontSize: fontSizes.xl, color: ink, textAlign: "right", writingDirection: "rtl" },
  arImmersive: {
    fontSize: fontSizes.md,
    color: muted,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: spacing.md,
  },
  juzHint: {
    fontSize: fontSizes.xs,
    color: muted,
    fontStyle: "italic",
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  toolRow: { gap: spacing.xs, marginBottom: spacing.sm },
  toolRowHelper: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  toolBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
  },
  toolBtnTxt: { fontWeight: "700", color: ink, fontSize: fontSizes.sm },
  wifiNote: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  verses: { gap: spacing.md, marginTop: spacing.xs },
  offlineRibbon: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    marginBottom: spacing.sm,
    fontStyle: "italic",
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: emerald,
  },
  verseCard: {
    backgroundColor: cardBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  verseCardMinimal: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  verseSpacer: { height: spacing.lg },
  ayahNum: { fontSize: fontSizes.xs, fontWeight: "800", color: bronze },
  ayahNumDim: { fontSize: fontSizes.xs, fontWeight: "600", color: muted },
  uth: {
    fontSize: fontSizes.lg,
    color: ink,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 32,
  },
  uthImmersive: {
    fontSize: 26,
    lineHeight: 42,
  },
  arabicWrap: {
    flexShrink: 1,
    width: "100%",
  },
  trans: {
    fontSize: fontSizes.md,
    color: ink,
    lineHeight: 24,
    flexShrink: 1,
    width: "100%",
  },
  transImmersive: {
    fontSize: fontSizes.md,
    color: ink,
    lineHeight: 26,
    flexShrink: 1,
    width: "100%",
  },
  transMuted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  bodyMuted: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
  rowActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  playAyah: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: "rgba(18,122,99,0.12)",
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.25)",
  },
  playAyahTxt: { fontSize: fontSizes.sm, fontWeight: "800", color: emerald },
  back: {
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  backTxt: { fontWeight: "700", color: ink },
});
