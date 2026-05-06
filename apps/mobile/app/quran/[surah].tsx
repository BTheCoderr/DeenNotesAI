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
import { readContinueReading } from "../../src/lib/quran-continue-reading";
import { safeBack } from "../../src/lib/navigation/safe-back";
import { readCachedChapterVerses } from "../../src/lib/quran-offline-cache";
import {
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

function QuranReaderRouteInner() {
  const { surah } = useLocalSearchParams<{ surah: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { isPremium, purchasesAvailable, openPaywall } = usePremium();
  const offlineAudioUnlocked = !purchasesAvailable || isPremium;
  const sidRaw = Array.isArray(surah) ? surah[0] : surah;
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

  const versesQ = useChapterVerses(chapterId);

  const [cachedPayload, setCachedPayload] = useState<ChapterVersesResponse | null>(null);
  const [resumeAyah, setResumeAyah] = useState<number | null>(null);

  useEffect(() => {
    if (chapterId == null) return;
    void readCachedChapterVerses(chapterId).then(setCachedPayload);
  }, [chapterId]);

  useEffect(() => {
    if (chapterId == null) return;
    void readContinueReading().then((c) => {
      if (c?.surahId === chapterId) setResumeAyah(c.ayah);
      else setResumeAyah(null);
    });
  }, [chapterId]);

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
