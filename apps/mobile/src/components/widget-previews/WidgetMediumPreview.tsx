import { StyleSheet, Text, View } from "react-native";

import type { DeennotesWidgetSnapshotV1 } from "../../lib/widget-snapshot";
import { border, bronze, cardBg, emerald, fontSerifHeading, fontSizes, ink, muted, radii, spacing } from "../../theme";

type Props = {
  snap: DeennotesWidgetSnapshotV1 | null;
};

export function WidgetMediumPreview({ snap }: Props) {
  const p = snap?.prayer;
  const d = snap?.dailyAyah;
  const c = snap?.continueReading;
  const r = snap?.reflectionReminder;
  const co = snap?.continuity;

  return (
    <View style={styles.shell}>
      <Text style={styles.brand}>DeenNotes · Today glance</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.eyebrow}>Next prayer</Text>
          <Text style={styles.h2}>{p?.nextPrayerName ?? "—"}</Text>
          <Text style={styles.meta}>{p?.countdownLabel ?? "—"}</Text>
          <Text style={styles.soft}>{p?.softPhrase ?? ""}</Text>
        </View>
        <View style={[styles.col, { flex: 1.25 }]}>
          <Text style={styles.eyebrow}>Daily ayah</Text>
          <Text style={styles.ayah}>
            {d
              ? `${d.surahName ?? `Surah ${d.surahId}`} · ${d.ayah}`
              : "Open Quran once — we’ll tuck a verse here."}
          </Text>
          {d?.translationLine ? (
            <Text style={styles.excerpt}>{d.translationLine}</Text>
          ) : (
            <Text style={styles.mutedTiny}>Translations fill when that surah is cached offline.</Text>
          )}
          {c ? (
            <>
              <Text style={[styles.eyebrow, { marginTop: 8 }]}>Return gently</Text>
              <Text style={styles.cont}>
                Continue {c.surahName ?? `Surah ${c.surahId}`} · Ayah {c.ayah}
              </Text>
            </>
          ) : null}
        </View>
      </View>
      {r?.subtitle ? (
        <Text style={styles.reflect}>{r.title ? `“${r.title}” — ` : ""}{r.subtitle}</Text>
      ) : null}
      {co?.returnTodayCopy ? <Text style={styles.whisper}>{co.returnTodayCopy}</Text> : null}
      {co?.lastReflectCopy ? <Text style={styles.whisper}>{co.lastReflectCopy}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 180,
  },
  brand: {
    fontSize: 10,
    fontWeight: "800",
    color: emerald,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "stretch", flexWrap: "wrap" },
  col: { flex: 1, gap: 4, minWidth: 120 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  h2: { fontFamily: fontSerifHeading, fontSize: 20, color: ink },
  meta: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
  soft: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  ayah: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
  excerpt: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 2,
  },
  mutedTiny: { fontSize: 11, color: muted, marginTop: 2 },
  cont: { fontSize: fontSizes.sm, color: ink, marginTop: 2 },
  reflect: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    marginTop: 4,
  },
  whisper: { fontSize: fontSizes.sm, color: bronze, marginTop: 2, lineHeight: 18 },
});
