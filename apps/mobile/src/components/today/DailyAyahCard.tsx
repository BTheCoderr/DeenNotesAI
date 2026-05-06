import { Link } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useDailyAyahGlance } from "../../hooks/useDailyAyahGlance";
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
} from "../../theme";

export function DailyAyahCard() {
  const q = useDailyAyahGlance();

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Daily ayah</Text>
      <Text style={styles.h2}>One verse, anchored to today</Text>

      {q.isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={emerald} />
        </View>
      ) : q.isError ? (
        <Text style={styles.bodyMuted}>
          {q.error instanceof Error ? q.error.message : "Could not resolve today’s ayah yet."}
        </Text>
      ) : q.data ? (
        <>
          <Text style={styles.meta}>
            {q.data.surahName ?? `Surah ${q.data.ref.surahId}`} · Ayah {q.data.ref.ayah}
          </Text>
          {q.data.arabic ? (
            <Text style={styles.ar} numberOfLines={3}>
              {q.data.arabic}
            </Text>
          ) : null}
          {q.data.translation ? (
            <Text style={styles.body} numberOfLines={4}>
              {q.data.translation}
            </Text>
          ) : (
            <Text style={styles.bodyMuted}>
              Open this surah once while online — we’ll cache translation lines for calmer offline
              reads and widgets.
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.bodyMuted}>Receiving the surah list without rush…</Text>
      )}

      <Link href={q.data ? `/quran/${q.data.ref.surahId}` : "/quran"} asChild>
        <Pressable style={styles.btn} accessibilityRole="button">
          <Text style={styles.btnTxt}>{q.data ? "Open in reader" : "Browse surahs"}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  center: { paddingVertical: spacing.md, alignItems: "flex-start" },
  kicker: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h2: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    color: ink,
  },
  meta: { fontSize: fontSizes.sm, fontWeight: "700", color: bronze },
  ar: {
    fontSize: fontSizes.md,
    color: ink,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 26,
  },
  body: { fontSize: fontSizes.sm, color: ink, lineHeight: 22 },
  bodyMuted: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  btn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  btnTxt: { color: emerald, fontWeight: "700", fontSize: fontSizes.md },
});
