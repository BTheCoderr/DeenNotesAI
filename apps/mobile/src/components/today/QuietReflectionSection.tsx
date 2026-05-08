import { StyleSheet, Text, View } from "react-native";

import {
  border,
  bronze,
  cardBg,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
} from "../../theme";

type Props = {
  promptLine: string;
};

export function QuietReflectionSection({ promptLine }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Note-inspired pause</Text>
      <Text style={styles.h2}>How is your heart today?</Text>
      <Text style={styles.body}>
        Take one slow breath. You do not need to fix anything yet — only notice, gently.
      </Text>
      <View style={styles.promptWrap}>
        <Text style={styles.prompt}>{promptLine}</Text>
      </View>
      <Text style={styles.placeholder}>
        Recent reflections will rest here when your notes journey connects. Nothing to prove — only to return.
      </Text>
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
  body: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  promptWrap: {
    backgroundColor: "rgba(184,134,11,0.08)",
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  prompt: {
    fontSize: fontSizes.md,
    color: ink,
    lineHeight: 24,
    fontStyle: "italic",
  },
  placeholder: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
