import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChapterVerses } from "../../src/api/hooks/useChapterVerses";
import { useChapters } from "../../src/api/hooks/useChapters";
import type { ChapterVersesResponse } from "../../src/api/types";
import { QuranSurahReader } from "../../src/components/quran/QuranSurahReader";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { usePremium } from "../../src/hooks/usePremium";
import { usePremiumFeatureFlags } from "../../src/hooks/usePremiumFeatureFlags";
import { readContinueReading } from "../../src/lib/quran-continue-reading";
import { safeBack } from "../../src/lib/navigation/safe-back";
import { readCachedChapterVerses } from "../../src/lib/quran-offline-cache";
import {
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";
import type { QuranReadingModeId } from "../../src/types/quran-reading";

const READER_MODE_LABELS: Record<QuranReadingModeId, string> = {
  singleAyah: "Guided • single ayah",
  ayahRange: "Guided • ayah range",
  fullSurah: "Full surah pace",
  juz: "Juz-guided window",
  continueReading: "Continuing where you softened your pace",
  fullQuran: "Whole Qur’an • one surah after another",
};

const MODE_IDS = new Set<string>([
  "singleAyah",
  "ayahRange",
  "fullSurah",
  "juz",
  "continueReading",
  "fullQuran",
]);

function coerceParam(raw: string | string[] | undefined): string | undefined {
  if (typeof raw === "string") return raw;
  return Array.isArray(raw) ? raw[0] : undefined;
}

function parseReadingMode(raw: string | string[] | undefined): QuranReadingModeId | null {
  const s = coerceParam(raw)?.trim();
  return s && MODE_IDS.has(s) ? (s as QuranReadingModeId) : null;
}

function QuranReaderRouteInner() {
  const { surah: surahRaw, ayahStart: ayahStartRawQ, ayahEnd: ayahEndRawQ, mode: modeRaw } =
    useLocalSearchParams<{
      surah: string | string[];
      ayahStart?: string | string[];
      ayahEnd?: string | string[];
      mode?: string | string[];
    }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { openPaywall } = usePremium();
  const { canUseOfflineQuranAudio } = usePremiumFeatureFlags();
  const offlineAudioUnlocked = canUseOfflineQuranAudio;
  const sidRaw = coerceParam(surahRaw);
  const chapterNum = Number(sidRaw);
  const chapterId =
    Number.isFinite(chapterNum) && chapterNum >= 1 && chapterNum <= 114
      ? Math.trunc(chapterNum)
      : null;

  const { data: chData } = useChapters();
  const chapterMeta = useMemo(
    () => chData?.chapters.find((c) => c.id === chapterId),
    [chData?.chapters, chapterId],
  );

  const readingModeParsed = useMemo(() => parseReadingMode(modeRaw), [modeRaw]);

  const ayahStartQ = useMemo(() => {
    const raw = coerceParam(ayahStartRawQ);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(1, Math.trunc(n)) : null;
  }, [ayahStartRawQ]);

  const ayahEndQ = useMemo(() => {
    const raw = coerceParam(ayahEndRawQ);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(1, Math.trunc(n)) : null;
  }, [ayahEndRawQ]);

  const ayahRange = useMemo(() => {
    if (readingModeParsed === "singleAyah" && ayahStartQ != null) {
      return { start: ayahStartQ, end: ayahStartQ };
    }
    if (ayahStartQ != null) {
      if (ayahEndQ != null) return { start: ayahStartQ, end: Math.max(ayahStartQ, ayahEndQ) };
      return { start: ayahStartQ };
    }
    if (ayahEndQ != null) return { start: 1, end: ayahEndQ };
    return null;
  }, [ayahStartQ, ayahEndQ, readingModeParsed]);

  const readingModeLabel = useMemo(() => {
    if (readingModeParsed) return READER_MODE_LABELS[readingModeParsed];
    if (ayahRange) return "Guided verses";
    return null;
  }, [readingModeParsed, ayahRange]);

  const versesQ = useChapterVerses(chapterId);

  const [cachedPayload, setCachedPayload] = useState<ChapterVersesResponse | null>(null);
  const [resumeAyah, setResumeAyah] = useState<number | null>(null);

  useEffect(() => {
    if (chapterId == null) return;
    void readCachedChapterVerses(chapterId).then(setCachedPayload);
  }, [chapterId]);

  useEffect(() => {
    if (chapterId == null) return;
    if (ayahStartQ != null) {
      setResumeAyah(ayahStartQ);
      return;
    }
    void readContinueReading().then((c) => {
      if (c?.surahId === chapterId) setResumeAyah(c.ayah);
      else setResumeAyah(null);
    });
  }, [chapterId, ayahStartQ]);

  const effectiveVersesPayload = versesQ.data?.verses?.length
    ? versesQ.data
    : cachedPayload?.verses?.length
      ? cachedPayload
      : null;

  const showOfflineRibbon =
    Boolean(effectiveVersesPayload?.verses?.length) &&
    (versesQ.isError ||
      (Boolean(cachedPayload?.verses?.length) && versesQ.isFetching && !versesQ.data?.verses?.length));

  if (chapterId == null) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <View style={styles.pad}>
          <Text style={styles.h1}>Surah</Text>
          <Text style={styles.body}>Pick a surah from the list.</Text>
          <Pressable onPress={() => safeBack(router, navigation, "/(tabs)/quran")} style={styles.back}>
            <Text style={styles.backTxt}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <QuranSurahReader
      chapterId={chapterId}
      chapterMeta={chapterMeta ?? null}
      effectivePayload={effectiveVersesPayload}
      versesPending={versesQ.isPending}
      versesHadError={versesQ.isError}
      hadCachedVersesFile={Boolean(cachedPayload?.verses?.length)}
      initialResumeAyah={resumeAyah}
      showOfflineRibbon={showOfflineRibbon}
      offlineAudioUnlocked={offlineAudioUnlocked}
      onRequestOfflineAudioPremium={() => openPaywall("offline_quran_audio")}
      ayahRange={ayahRange}
      readingMode={readingModeParsed}
      readingModeLabel={readingModeLabel}
    />
  );
}

export default function QuranReaderRoute() {
  return (
    <ScreenErrorBoundary scope="quran-reader">
      <QuranReaderRouteInner />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { padding: spacing.xl, gap: spacing.md },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 26,
    fontWeight: "600",
    color: ink,
  },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
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
