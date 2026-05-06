import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { NoteModeContract, NoteModeId } from "../contracts/note-modes";
import { border, bronze, cardBg, fontSizes, ink, muted, radii, spacing } from "../theme";

const ICON_BY_MODE: Record<NoteModeId, ComponentProps<typeof Ionicons>["name"]> = {
  record_khutbah: "mic-outline",
  paste_notes: "document-text-outline",
  quran_reflection: "book-outline",
  upload_audio: "musical-notes-outline",
  youtube_lecture: "logo-youtube",
  upload_pdf: "document-attach-outline",
  personal_reminder: "bulb-outline",
};

type Props = {
  item: NoteModeContract;
  onPress: (item: NoteModeContract) => void;
};

export function NoteModeRow({ item, onPress }: Props) {
  const ion = ICON_BY_MODE[item.id];

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name={ion} size={26} color={bronze} />
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
