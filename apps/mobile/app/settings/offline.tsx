import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OFFLINE_CACHE_SURAH_MAX,
  OFFLINE_CACHE_SURAH_MIN,
  type OfflineReadingPreferencesV1,
} from "../../src/contracts/offline-reading-preferences";
import {
  readOfflineReadingPreferences,
  writeOfflineReadingPreferences,
} from "../../src/lib/offline-reading-prefs-storage";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

export default function OfflineQuranPreferencesScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<OfflineReadingPreferencesV1 | null>(null);

  const load = useCallback(async () => {
    setPrefs(await readOfflineReadingPreferences());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function patch(next: Partial<OfflineReadingPreferencesV1>) {
    if (!prefs) return;
    setPrefs({
      ...prefs,
      ...next,
      schemaVersion: 1,
    });
    await writeOfflineReadingPreferences(next);
    void load();
  }

  if (!prefs) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <Text style={styles.muted}>Gathering your saved preferences…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          We quietly cache verses for surahs you actually open — enough for transit and widgets, not the
          entire mushaf yet.
        </Text>

        <Pressable onPress={() => router.push("/quran/settings")} style={styles.linkRow}>
          <Text style={styles.linkTxt}>Listening, reciter & translation → Quran preferences</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.rowLbl}>Cache recent surahs</Text>
              <Text style={styles.rowSub}>Turn off if you prefer only live network reads.</Text>
            </View>
            <Switch value={prefs.cacheEnabled} onValueChange={(v) => void patch({ cacheEnabled: v })} />
          </View>

          <Text style={styles.label}>
            Max surahs retained ({OFFLINE_CACHE_SURAH_MIN}–{OFFLINE_CACHE_SURAH_MAX})
          </Text>
          <TextInput
            key={`max-${prefs.maxCachedSurahs}`}
            style={styles.input}
            keyboardType="number-pad"
            defaultValue={String(prefs.maxCachedSurahs)}
            placeholderTextColor={muted}
            onEndEditing={(e) => {
              const n = Number(e.nativeEvent.text.trim());
              if (!Number.isFinite(n)) return;
              void patch({ maxCachedSurahs: Math.trunc(n) });
            }}
          />
          <Text style={styles.hint}>Oldest touch drops first when space is tight.</Text>
        </View>

        <View style={[styles.banner, !prefs.cacheEnabled && { opacity: 0.65 }]}>
          <Text style={styles.bannerK}>Practice note</Text>
          <Text style={styles.bannerT}>
            Surahs you revisit build the richest offline layer for daily glance and continue-reading previews.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 48, gap: spacing.md },
  intro: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  linkRow: { alignSelf: "flex-start", marginBottom: spacing.sm },
  linkTxt: { fontSize: fontSizes.sm, fontWeight: "800", color: emerald },
  muted: { fontSize: fontSizes.sm, color: muted, padding: spacing.xl },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLbl: { fontSize: fontSizes.md, color: ink, fontWeight: "700" },
  rowSub: { fontSize: fontSizes.sm, color: muted, marginTop: 4, lineHeight: 18 },
  label: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
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
  hint: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  banner: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: "rgba(18,122,99,0.06)",
    padding: spacing.md,
    gap: 4,
  },
  bannerK: {
    fontSize: 11,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bannerT: { fontSize: fontSizes.sm, color: ink, lineHeight: 20 },
});
