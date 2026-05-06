import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MobileWordmark } from "../src/components/brand/MobileWordmark";
import { FadeInView } from "../src/components/FadeInView";
import { NoteModeRow } from "../src/components/NoteModeRow";
import type { NoteModeContract } from "../src/contracts/note-modes";
import { NOTE_MODE_CONTRACTS } from "../src/contracts/note-modes";
import {
  emerald,
  fontSizes,
  muted,
  spacing,
  stone,
} from "../src/theme";

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
    if (item.id === "record_khutbah") {
      router.push("/recording/session");
      return;
    }
    if (item.comingSoon) {
      Alert.alert(
        `${item.label} is almost here`,
        "We're finishing ingestion and privacy safeguards for uploads and links. For now, use Record Khutbah, Paste Notes, Quran Reflection, or Personal Reminder — your heart-work stays private-first on device.",
        [{ text: "OK", style: "default" }],
      );
      return;
    }
    router.push(`/compose/${item.id}`);
  }

  return (
    <FadeInView>
      <View style={styles.wrap}>
        <MobileWordmark height={32} padded style={{ alignSelf: "center" }} />
        <Text style={styles.lead}>
          Choose how you want to capture. Contracts match the web app; modes still in progress are labeled
          clearly.
        </Text>
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {rows.map((item) => (
            <NoteModeRow key={item.id} item={item} onPress={onPress} />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open saved khutbah recordings"
            style={styles.libLinkWrap}
            onPress={() => router.push("/recordings")}
          >
            <Text style={styles.libLink}>Saved recordings on this device</Text>
          </Pressable>
        </ScrollView>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: stone, paddingHorizontal: spacing.xl },
  lead: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 22,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  list: { paddingBottom: 40, gap: spacing.sm },
  libLinkWrap: { paddingVertical: spacing.lg, paddingBottom: spacing.xl, alignItems: "center" },
  libLink: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
});
