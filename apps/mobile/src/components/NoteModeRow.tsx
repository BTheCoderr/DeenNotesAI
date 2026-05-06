import { Pressable, StyleSheet, Text, View } from "react-native";

import type { NoteModeContract } from "../contracts/note-modes";
import { border, bronze, cardBg, emerald, fontSizes, ink, muted, radii, spacing } from "../theme";

type Props = {
  item: NoteModeContract;
  onPress: (item: NoteModeContract) => void;
};

export function NoteModeRow({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Text style={styles.iconTxt}>{item.iconHint.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.label}</Text>
            {item.comingSoon ? (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>Soon</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.92 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: "rgba(184,134,11,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconTxt: { fontSize: fontSizes.lg, fontWeight: "700", color: bronze },
  body: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs },
  title: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  badge: {
    backgroundColor: "rgba(184,134,11,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  desc: { fontSize: fontSizes.sm, color: muted, marginTop: 4, lineHeight: 20 },
  chev: { fontSize: 20, color: muted, fontWeight: "600" },
});
