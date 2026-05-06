import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChapters } from "../../src/api/hooks/useChapters";
import { offlineReflectionSubtitle } from "../../src/lib/quran-meta";
import type { Chapter } from "../../src/api/types";
import { border, cardBg, emerald, fontSizes, ink, muted, radii, spacing, stone } from "../../src/theme";

export default function QuranSurahListScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useChapters();
  const [q, setQ] = useState("");

  const chapters = data?.chapters ?? [];
  const subtitle = offlineReflectionSubtitle(data?.meta ?? null);

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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <Text style={styles.h1}>Quran</Text>
      {subtitle ? <Text style={styles.note}>{subtitle}</Text> : null}
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search surah"
        placeholderTextColor={muted}
        style={styles.search}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={emerald} />
        </View>
      ) : error ? (
        <Text style={styles.err}>{error instanceof Error ? error.message : "Error"}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SurahRow chapter={item} onPress={() => router.push(`/quran/${item.id}`)} />
          )}
        />
      )}
    </SafeAreaView>
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
  h1: { fontSize: 28, fontWeight: "800", color: ink, marginBottom: spacing.xs },
  note: { fontSize: fontSizes.xs, color: muted, marginBottom: spacing.sm, lineHeight: 18 },
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
  err: { color: "#8b2942", marginBottom: spacing.md },
  list: { paddingBottom: 120 },
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
