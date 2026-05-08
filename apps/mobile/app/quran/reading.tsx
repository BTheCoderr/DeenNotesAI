import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuranReadingModePicker } from "../../src/components/quran/QuranReadingModePicker";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { useChapters } from "../../src/api/hooks/useChapters";
import { getJuzFirstAyah } from "../../src/lib/quran/juz-meta";
import { persistHubSelection, resolveContinueReadingPosition } from "../../src/services/quranReadingService";
import type { QuranReadingModeId } from "../../src/types/quran-reading";
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

const LABELS: Record<QuranReadingModeId, string> = {
  continueReading: "Continue reading • where you paused",
  singleAyah: "Single ayah • focused",
  ayahRange: "Ayah range",
  fullSurah: "Full surah • unhurried",
  juz: "Juz / part • guided start",
  fullQuran: "Whole Qur’an rhythm • blessed khatm",
};

function QuranReadingHubInner() {
  const router = useRouter();
  const { data: chData } = useChapters();
  const chapters = useMemo(() => chData?.chapters ?? [], [chData?.chapters]);

  const [mode, setMode] = useState<QuranReadingModeId>("fullSurah");
  const [surahPick, setSurahPick] = useState<string>("1");
  const [startAyah, setStartAyah] = useState<string>("1");
  const [endAyah, setEndAyah] = useState<string>("7");
  const [juzNum, setJuzNum] = useState<string>("1");

  const surahChoices = useMemo(() => [...chapters].sort((a, b) => a.id - b.id), [chapters]);

  function safeSurahId(): number | null {
    const n = Number(surahPick);
    return Number.isFinite(n) ? Math.min(114, Math.max(1, Math.trunc(n))) : null;
  }

  async function handleContinueReading() {
    await persistHubSelection({ mode: "continueReading", selectedRange: null });
    const pos = await resolveContinueReadingPosition();
    if (!pos) {
      Alert.alert(
        "No saved position yet",
        "Open a surah reader and pause on a verse — we keep that gentle spot on-device.",
      );
      return;
    }
    router.push(`/quran/${pos.surahId}?ayahStart=${pos.ayah}&mode=continueReading`);
  }

  function openSurahHref(sid: number, q: Record<string, string>) {
    const qs = new URLSearchParams(q).toString();
    router.push(qs.length ? `/quran/${sid}?${qs}` : `/quran/${sid}`);
  }

  async function go() {
    if (mode === "continueReading") {
      await handleContinueReading();
      return;
    }

    if (mode === "fullQuran") {
      const fatihaVerses = chapters.find((c) => c.id === 1)?.versesCount ?? 7;
      await persistHubSelection({
        mode: "fullQuran",
        selectedRange: { surahId: 1, startAyah: 1, endAyah: fatihaVerses },
      });
      openSurahHref(1, { ayahStart: "1", mode: "fullQuran" });
      return;
    }

    if (mode === "juz") {
      const j = Math.min(30, Math.max(1, Math.trunc(Number(juzNum) || 1)));
      const st = getJuzFirstAyah(j);
      if (!st) {
        Alert.alert("Juz unavailable", "Please pick a valid juz between 1 and 30.");
        return;
      }
      const meta = chapters.find((c) => c.id === st.surah);
      const endAyah = meta?.versesCount ?? st.ayah;
      await persistHubSelection({
        mode: "juz",
        selectedRange: { surahId: st.surah, startAyah: st.ayah, endAyah },
      });
      openSurahHref(st.surah, { ayahStart: String(st.ayah), mode: "juz" });
      return;
    }

    const sid = safeSurahId();
    if (sid == null) {
      Alert.alert("Pick a surah", "Enter a chapter number between 1 and 114.");
      return;
    }

    const meta = chapters.find((c) => c.id === sid);

    if (mode === "singleAyah") {
      const ay = Math.max(1, Math.trunc(Number(startAyah) || 1));
      await persistHubSelection({
        mode: "singleAyah",
        selectedRange: { surahId: sid, startAyah: ay, endAyah: ay },
      });
      openSurahHref(sid, {
        ayahStart: String(ay),
        ayahEnd: String(ay),
        mode: "singleAyah",
      });
      return;
    }

    if (mode === "ayahRange") {
      const lo = Math.max(1, Math.trunc(Number(startAyah) || 1));
      const hi = Math.max(lo, Math.trunc(Number(endAyah) || lo));
      await persistHubSelection({
        mode: "ayahRange",
        selectedRange: { surahId: sid, startAyah: lo, endAyah: hi },
      });
      openSurahHref(sid, { ayahStart: String(lo), ayahEnd: String(hi), mode: "ayahRange" });
      return;
    }

    await persistHubSelection({
      mode: "fullSurah",
      selectedRange:
        meta != null ? { surahId: sid, startAyah: 1, endAyah: meta.versesCount } : null,
    });
    openSurahHref(sid, { mode: "fullSurah" });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>Quran • reading modes</Text>
        <Text style={styles.lead}>
          Choose intention first — verses stay on your phone with gentle Arabic, translations, bookmarks, and
          reflections when you tap Reflect on this.
        </Text>

        <QuranReadingModePicker selected={mode} onSelectMode={setMode} />

        {mode !== "continueReading" && mode !== "fullQuran" && mode !== "juz" ? (
          <View style={styles.form}>
            <Text style={styles.k}>Surah</Text>
            <TextInput
              value={surahPick}
              onChangeText={setSurahPick}
              keyboardType="number-pad"
              placeholder="e.g. 2"
              placeholderTextColor={muted}
              style={styles.input}
            />
            {(mode === "singleAyah" || mode === "ayahRange") && (
              <>
                <Text style={styles.k}>{mode === "singleAyah" ? "Ayah" : "From ayah"}</Text>
                <TextInput
                  value={startAyah}
                  onChangeText={setStartAyah}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={muted}
                  style={styles.input}
                />
              </>
            )}
            {mode === "ayahRange" ? (
              <>
                <Text style={styles.k}>Through ayah</Text>
                <TextInput
                  value={endAyah}
                  onChangeText={setEndAyah}
                  keyboardType="number-pad"
                  placeholder={startAyah}
                  placeholderTextColor={muted}
                  style={styles.input}
                />
              </>
            ) : null}
          </View>
        ) : null}

        {mode === "juz" ? (
          <View style={styles.form}>
            <Text style={styles.k}>Jūz (1 – 30)</Text>
            <TextInput
              value={juzNum}
              onChangeText={setJuzNum}
              keyboardType="number-pad"
              placeholder="15"
              placeholderTextColor={muted}
              style={styles.input}
            />
          </View>
        ) : null}

        <View style={styles.note}>
          <Text style={styles.noteTxt}>{LABELS[mode]}</Text>
          {surahChoices.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRail}>
              {surahChoices.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSurahPick(String(s.id))}
                  style={({ pressed }) => [styles.chip, pressed && { opacity: 0.92 }]}
                >
                  <Text style={styles.chipTxt}>{s.id}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.mutedQuiet}>Chapter index appears when gently online once.</Text>
          )}
        </View>

        <Pressable accessibilityRole="button" onPress={() => void go()} style={styles.primary}>
          <Text style={styles.primaryTxt}>
            {mode === "continueReading" ? "Return to paused ayah" : "Open calm reader"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(tabs)/quran")} style={styles.ghost}>
          <Text style={styles.ghostTxt}>Surah catalogue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function QuranReadingHubRoute() {
  return (
    <ScreenErrorBoundary scope="quran-reading-hub">
      <QuranReadingHubInner />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xxl,
    fontWeight: "600",
    color: ink,
  },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  form: {
    marginTop: -spacing.sm,
    gap: spacing.sm,
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
  },
  k: {
    fontSize: 11,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.85,
    marginBottom: -4,
  },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: "#fff",
  },
  note: {
    gap: spacing.sm,
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  noteTxt: { fontSize: fontSizes.sm, color: ink, fontWeight: "700" },
  chipRail: { flexGrow: 0 },
  chip: {
    marginRight: 8,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.22)",
    backgroundColor: cardBg,
  },
  chipTxt: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
  mutedQuiet: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  primary: {
    backgroundColor: emerald,
    paddingVertical: spacing.md + 4,
    borderRadius: radii.pill,
    alignItems: "center",
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryTxt: { fontSize: fontSizes.md, color: "#fff", fontWeight: "800" },
  ghost: {
    alignSelf: "center",
    paddingVertical: spacing.sm + 6,
    paddingHorizontal: spacing.lg + 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
  },
  ghostTxt: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
});
