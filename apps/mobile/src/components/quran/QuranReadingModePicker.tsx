import { Pressable, StyleSheet, Text, View } from "react-native";

import type { QuranReadingModeId } from "../../types/quran-reading";
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

const MODES: { id: QuranReadingModeId; title: string; hint: string }[] = [
  { id: "continueReading", title: "Continue reading", hint: "Return to where you paused." },
  { id: "singleAyah", title: "Single ayah", hint: "Sit with one verse at a time." },
  { id: "ayahRange", title: "Ayah range", hint: "A stretch within a surah." },
  { id: "fullSurah", title: "Full surah", hint: "The whole chapter, unhurried." },
  { id: "juz", title: "Juz / part", hint: "Start at your chosen thirtieth." },
  { id: "fullQuran", title: "Full Quran", hint: "Begin from Al-Fatiha; progress saves as you go." },
];

type Props = {
  selected?: QuranReadingModeId | null;
  onSelectMode: (m: QuranReadingModeId) => void;
};

/** Mode list for Quran reading hub — emerald/stone cards. */
export function QuranReadingModePicker({ selected, onSelectMode }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h}>How would you like to read?</Text>
      <Text style={styles.lead}>Choose a pace — progress stays on this device between sessions.</Text>
      <View style={styles.grid}>
        {MODES.map((m) => {
          const active = selected === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => onSelectMode(m.id)}
              style={({ pressed }) => [
                styles.tile,
                active && styles.tileActive,
                pressed && !active && { opacity: 0.92 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={m.title}
            >
              <Text style={[styles.title, active && styles.titleActive]}>{m.title}</Text>
              <Text style={[styles.hint, active && styles.hintActive]}>{m.hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  h: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: ink,
  },
  lead: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
  },
  grid: {
    gap: spacing.sm,
  },
  tile: {
    width: "100%",
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 6,
  },
  tileActive: {
    borderColor: "rgba(18,122,99,0.45)",
    backgroundColor: "rgba(18,122,99,0.06)",
  },
  title: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  titleActive: { color: emerald },
  hint: {
    fontSize: fontSizes.xs,
    color: muted,
    lineHeight: 16,
    fontWeight: "500",
  },
  hintActive: { color: bronze },
});
