import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FALLBACK_MOBILE_RECITER_ID, fetchRecitations } from "../../src/api/quran";
import { CalmPulseBlock } from "../../src/components/skeleton/CalmSkeleton";
import { REFLECTION_LANGUAGE_OPTIONS } from "../../src/contracts/quran-preferences";
import type { QuranPreferenceContract, ReflectionLanguageCode } from "../../src/contracts/quran-preferences";
import { usePremium } from "../../src/hooks/usePremium";
import {
  readMobileQuranPrefs,
  writeMobileQuranPrefs,
} from "../../src/lib/mobile-quran-prefs";
import { readRecitersSnapshot, writeRecitersSnapshot } from "../../src/lib/reciters-snapshot-storage";
import {
  writePreferredReadingSlice,
  readContinueReading,
  type PreferredReadingSlice,
} from "../../src/lib/quran-continue-reading";
import type { RecitationResourceDto } from "../../src/api/types";
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

export default function QuranSettingsScreen() {
  const { isPremium, purchasesAvailable, openPaywall } = usePremium();
  const offlineDownloadsUnlocked = !purchasesAvailable || isPremium;
  const ramadanReadingUnlocked = offlineDownloadsUnlocked;
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<QuranPreferenceContract | null>(null);
  const [lang, setLang] = useState<ReflectionLanguageCode>("en");
  const [immersive, setImmersive] = useState(false);
  const [slice, setSlice] = useState<PreferredReadingSlice>("daily");

  useEffect(() => {
    void readMobileQuranPrefs().then((p) => {
      setPrefs(p);
      setLang(p.language ?? "en");
      setImmersive(Boolean(p.immersiveReading));
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (patch: Partial<QuranPreferenceContract>) => {
    await writeMobileQuranPrefs(patch);
    setPrefs(await readMobileQuranPrefs());
  }, []);

  const recitationsQ = useQuery({
    queryKey: ["mobile", "quran", "recitations"],
    queryFn: fetchRecitations,
    staleTime: 86_400_000,
  });

  const [offlineReciters, setOfflineReciters] = useState<RecitationResourceDto[]>([]);

  useEffect(() => {
    void readRecitersSnapshot().then((s) => {
      if (s?.items?.length) setOfflineReciters(s.items);
    });
  }, []);

  useEffect(() => {
    if (recitationsQ.data?.length) {
      setOfflineReciters(recitationsQ.data);
      void writeRecitersSnapshot(recitationsQ.data);
    }
  }, [recitationsQ.data]);

  useEffect(() => {
    void readContinueReading().then((c) => {
      if (c?.preferredReadingSlice) setSlice(c.preferredReadingSlice);
    });
  }, []);

  if (loading || !prefs) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
        <View style={styles.center} accessibilityRole="progressbar">
          <CalmPulseBlock height={88} accessibilityLabel="Quran preferences preparing" style={{ width: "100%" }} />
          <CalmPulseBlock height={14} style={{ width: "52%", marginTop: spacing.md }} />
          <Text style={[styles.muted, { marginTop: spacing.lg, textAlign: "center" }]}>
            Gathering reading preferences without rush…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const wifiOnly = prefs.audioWifiOnly ?? false;
  const autoDl = prefs.autoDownloadContinueSurah ?? false;
  const cacheMb = prefs.audioMaxCacheMb ?? 200;
  const reciterId =
    prefs.reciterId?.trim() || FALLBACK_MOBILE_RECITER_ID;
  const quality = prefs.audioQuality ?? "default";

  const reciterChoices =
    offlineReciters.length > 0 ? offlineReciters : [];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Quran settings</Text>
        <Text style={styles.lead}>
          Local, calm preferences for reading and listening. Verse caching also lives under Offline
          reading in Settings.
        </Text>

        <View style={styles.card}>
          <Text style={styles.k}>Reflection language</Text>
          <Text style={styles.muted}>Used for reflection prompts aligned with Mobile M2 contracts.</Text>
          <View style={styles.chips}>
            {REFLECTION_LANGUAGE_OPTIONS.map((opt) => {
              const on = lang === opt.code;
              return (
                <Pressable
                  key={opt.code}
                  onPress={() => {
                    setLang(opt.code);
                    void persist({ language: opt.code });
                  }}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Immersive reading</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Focus mode layout</Text>
              <Text style={styles.muted}>Larger Arabic, softer chrome — reader only.</Text>
            </View>
            <Switch
              value={immersive}
              onValueChange={(v) => {
                setImmersive(v);
                void persist({ immersiveReading: v });
              }}
              trackColor={{ true: emerald, false: border }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Ramadan prep (intent only)</Text>
          <Text style={styles.muted}>Tags your continue-reading streak for nightly tarawīh tone — no leaderboard yet.</Text>
          <View style={styles.rowWrap}>
            {(
              [
                ["daily", "Daily"],
                ["taraweeh", "Tarawīh tone"],
              ] as const
            ).map(([code, lbl]) => {
              const active = slice === code;
              return (
                <Pressable
                  key={code}
                  style={[styles.miniChip, active && styles.miniChipOn]}
                  onPress={() => {
                    if (code === "taraweeh" && !ramadanReadingUnlocked) {
                      openPaywall("ramadan_planning");
                      return;
                    }
                    setSlice(code);
                    void writePreferredReadingSlice(code);
                    void persist({ offlineIntent: "planned" });
                  }}
                >
                  <Text style={[styles.miniChipTxt, active && styles.miniChipTxtOn]}>{lbl}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Recitation</Text>
          {recitationsQ.isFetching && !reciterChoices.length ? (
            <CalmPulseBlock height={12} style={{ alignSelf: "flex-start", marginVertical: 8, width: "38%" }} accessibilityLabel="Reciter list preparing" />
          ) : null}
          {recitationsQ.isError && !reciterChoices.length ? (
            <Text style={styles.muted}>
              Reciter list rests offline — connect once or use default ({FALLBACK_MOBILE_RECITER_ID}).
            </Text>
          ) : (
            <>
              <Text style={styles.muted}>Choose a narrator for verse audio proxies.</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={styles.rowWrap}>
                  <Pressable
                    style={[styles.miniChip, reciterId === FALLBACK_MOBILE_RECITER_ID && styles.miniChipOn]}
                    onPress={() => void persist({ reciterId: FALLBACK_MOBILE_RECITER_ID })}
                  >
                    <Text
                      style={[
                        styles.miniChipTxt,
                        reciterId === FALLBACK_MOBILE_RECITER_ID && styles.miniChipTxtOn,
                      ]}
                    >
                      Default
                    </Text>
                  </Pressable>
                  {reciterChoices.slice(0, 24).map((r) => {
                    const id = String(r.id);
                    const on = id === String(reciterId);
                    const label = r.reciterName ?? r.translatedName ?? `Recitation ${id}`;
                    return (
                      <Pressable
                        key={id}
                        style={[styles.miniChip, on && styles.miniChipOn]}
                        onPress={() => void persist({ reciterId: id })}
                      >
                        <Text style={[styles.miniChipTxt, on && styles.miniChipTxtOn]} numberOfLines={1}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Audio quality</Text>
          <Text style={styles.muted}>
            &ldquo;High&rdquo; is reserved until the CDN exposes bitrate choice — harmless placeholder now.
          </Text>
          <View style={styles.rowWrap}>
            {(["default", "high"] as const).map((q) => {
              const active = quality === q;
              return (
                <Pressable
                  key={q}
                  style={[styles.miniChip, active && styles.miniChipOn]}
                  onPress={() => void persist({ audioQuality: q })}
                >
                  <Text style={[styles.miniChipTxt, active && styles.miniChipTxtOn]}>
                    {q === "default" ? "Standard" : "High (prep)"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Wi‑Fi only audio caches</Text>
              <Text style={styles.muted}>Skips verse downloads on cellular.</Text>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={(v) => void persist({ audioWifiOnly: v })}
              trackColor={{ true: emerald, false: border }}
            />
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Auto-queue continue-reading</Text>
              <Text style={styles.muted}>When you open Quran, lightly fetch a few verses ahead — never bulk.</Text>
            </View>
            <Switch
              value={autoDl}
              onValueChange={(v) => {
                if (v && !offlineDownloadsUnlocked) {
                  openPaywall("offline_quran_audio");
                  return;
                }
                void persist({ autoDownloadContinueSurah: v });
              }}
              trackColor={{ true: emerald, false: border }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Offline verse audio budget</Text>
          <Text style={styles.muted}>Approximate MB before older files soften away (LRU).</Text>
          <TextInput
            keyboardType="number-pad"
            editable={offlineDownloadsUnlocked}
            value={String(cacheMb)}
            onChangeText={(t) => {
              if (!offlineDownloadsUnlocked) {
                openPaywall("offline_quran_audio");
                return;
              }
              const n = Number(t.replace(/[^\d]/g, ""));
              if (!Number.isFinite(n) || !t.trim()) return;
              void persist({ audioMaxCacheMb: n });
            }}
            placeholder="200"
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Translation & tafsir</Text>
          <Text style={styles.muted}>
            Mirrors the server bundle you last fetched online — resource pickers will align with web when signed in.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 96, gap: spacing.md },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 26,
    fontWeight: "600",
    color: ink,
  },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  k: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
    minHeight: 44,
    justifyContent: "center",
  },
  chipOn: { borderColor: emerald, backgroundColor: "rgba(18,122,99,0.1)" },
  chipTxt: { fontSize: fontSizes.sm, color: ink, fontWeight: "600" },
  chipTxtOn: { color: emerald },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  miniChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    maxWidth: "100%",
    backgroundColor: stone,
    marginBottom: 4,
  },
  miniChipOn: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.08)",
  },
  miniChipTxt: { fontSize: fontSizes.sm, color: ink, fontWeight: "600" },
  miniChipTxtOn: { color: emerald },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSizes.md,
    color: ink,
    marginTop: 4,
  },
});
