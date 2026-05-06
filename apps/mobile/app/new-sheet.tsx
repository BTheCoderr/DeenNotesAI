import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { NoteModeRow } from "../src/components/NoteModeRow";
import type { NoteModeContract } from "../src/contracts/note-modes";
import { NOTE_MODE_CONTRACTS } from "../src/contracts/note-modes";
import { fontSizes, ink, spacing, stone } from "../src/theme";

/** Order per product spec */
const MODE_ORDER: ReadonlyArray<NoteModeContract["id"]> = [
  "record_khutbah",
  "paste_notes",
  "quran_reflection",
  "upload_audio",
  "youtube_lecture",
  "upload_pdf",
  "personal_reminder",
];

export default function NewSheetScreen() {
  const router = useRouter();

  const rows = MODE_ORDER.map((id) =>
    NOTE_MODE_CONTRACTS.find((m) => m.id === id),
  ).filter((m): m is NoteModeContract => Boolean(m));

  function onPress(item: NoteModeContract) {
    if (item.comingSoon) {
      Alert.alert(
        item.label,
        "This capture mode is coming soon. You can still reflect with Paste Notes or Qur'an Reflection today.",
      );
      return;
    }
    router.push(`/compose/${item.id}`);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>
        Choose how you want to capture — all flows stay private-first.
      </Text>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {rows.map((item) => (
          <NoteModeRow key={item.id} item={item} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: stone, paddingHorizontal: spacing.xl },
  intro: {
    fontSize: fontSizes.sm,
    color: ink,
    opacity: 0.85,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  list: { paddingBottom: 40, gap: spacing.sm },
});
