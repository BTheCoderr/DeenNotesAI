import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NoteModeContract, NoteModeId } from "../src/contracts/note-modes";
import { NOTE_MODE_CONTRACTS } from "../src/contracts/note-modes";
import { safeBack } from "../src/lib/navigation/safe-back";
import { usePremium } from "../src/hooks/usePremium";
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
} from "../src/theme";

type Ion = ComponentProps<typeof Ionicons>["name"];

const ICON_BY_MODE: Record<NoteModeId, Ion> = {
  record_khutbah: "mic-outline",
  paste_notes: "document-text-outline",
  quran_reflection: "book-outline",
  upload_audio: "cloud-upload-outline",
  youtube_lecture: "logo-youtube",
  upload_pdf: "document-attach-outline",
  personal_reminder: "bulb-outline",
};

/** Primary capture paths — polished sheet, same routes & gating as before. */
const PRIMARY: ReadonlyArray<{
  modeId: NoteModeId;
  title: string;
  subtitle: string;
}> = [
  {
    modeId: "record_khutbah",
    title: "Record audio · Khutbah",
    subtitle: "Capture what you heard — stays on device first",
  },
  {
    modeId: "youtube_lecture",
    title: "YouTube link",
    subtitle: "Lecture or khutbah replay (ingestion in progress)",
  },
  {
    modeId: "upload_audio",
    title: "Upload audio",
    subtitle: "Existing recordings — private-first summaries",
  },
  {
    modeId: "quran_reflection",
    title: "Quran study · Reflection",
    subtitle: "Ayat you’re sitting with — notes & prompts",
  },
];

export default function NewSheetScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const premium = usePremium();
  const { assertPremiumOrPaywall } = premium;

  const close = useCallback(() => {
    safeBack(router, navigation, "/(tabs)");
  }, [router, navigation]);

  function resolveContract(id: NoteModeId): NoteModeContract | undefined {
    return NOTE_MODE_CONTRACTS.find((m) => m.id === id);
  }

  function onPrimaryPress(item: (typeof PRIMARY)[number]) {
    const contract = resolveContract(item.modeId);
    if (!contract) return;

    if (contract.id === "record_khutbah") {
      if (!premium.isHydrated) return;
      if (!assertPremiumOrPaywall("khutbah_recording")) return;
      router.push("/recording/session");
      return;
    }
    if (contract.comingSoon) {
      Alert.alert(
        `${contract.label} is almost here`,
        "We’re finishing ingestion and privacy safeguards for uploads and links. For now, use Record Khutbah, Paste notes, Quran reflection, or Personal reminder — your heart-work stays private-first on device.",
        [{ text: "OK", style: "default" }],
      );
      return;
    }
    router.push(`/compose/${contract.id}`);
  }

  function onSecondary(id: NoteModeId) {
    const contract = resolveContract(id);
    if (!contract || contract.comingSoon) return;
    router.push(`/compose/${contract.id}`);
  }

  const bottomPad = Math.max(insets.bottom, spacing.md);

  return (
    <View style={styles.root} accessibilityViewIsModal>
      <Pressable
        style={styles.scrim}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Dismiss new note menu"
      />
      <View style={[styles.sheet, { paddingBottom: bottomPad }]} pointerEvents="box-none">
        <View style={styles.dragHint} accessibilityElementsHidden />

        <Text style={styles.sheetTitle}>New Reflection</Text>
        <Text style={styles.sheetSub}>Choose how you want to capture</Text>

        <View style={styles.rowList}>
          {PRIMARY.map((row) => {
            const contract = resolveContract(row.modeId);
            const soon = Boolean(contract?.comingSoon);
            return (
              <Pressable
                key={row.modeId}
                accessibilityRole="button"
                accessibilityState={{ disabled: !contract }}
                onPress={() => onPrimaryPress(row)}
                style={({ pressed }) => [styles.bigRow, pressed && styles.bigRowPressed]}
              >
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={ICON_BY_MODE[row.modeId]}
                    size={26}
                    color={bronze}
                  />
                </View>
                <View style={styles.bigRowBody}>
                  <View style={styles.bigRowTitleLine}>
                    <Text style={styles.bigRowTitle}>{row.title}</Text>
                    {soon ? (
                      <View style={styles.soonBadge}>
                        <Text style={styles.soonBadgeTxt}>Soon</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.bigRowSub}>{row.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={muted} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.altRow}>
          <Pressable
            onPress={() => onSecondary("paste_notes")}
            style={styles.altChip}
            accessibilityRole="button"
            accessibilityLabel="Paste notes"
          >
            <Text style={styles.altChipTxt}>Paste notes</Text>
          </Pressable>
          <Pressable
            onPress={() => onSecondary("personal_reminder")}
            style={styles.altChip}
            accessibilityRole="button"
            accessibilityLabel="Personal reminder"
          >
            <Text style={styles.altChipTxt}>Personal reminder</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open saved khutbah recordings"
          style={styles.recLinkWrap}
          onPress={() => router.push("/recordings")}
        >
          <Text style={styles.recLink}>Saved recordings on this device</Text>
        </Pressable>

        <View style={styles.closeWrap}>
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [styles.closeCircle, pressed && styles.closeCirclePressed]}
          >
            <Ionicons name="close" size={28} color={ink} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 25, 0.45)",
  },
  sheet: {
    backgroundColor: cardBg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: "88%",
    gap: spacing.md,
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 28,
    },
  },
  dragHint: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(107,114,118,0.22)",
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sheetTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: ink,
    textAlign: "center",
  },
  sheetSub: {
    fontSize: fontSizes.sm,
    color: muted,
    textAlign: "center",
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  rowList: { gap: spacing.sm },
  bigRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#faf9f7",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    minHeight: 76,
  },
  bigRowPressed: { opacity: 0.94 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(184,134,11,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  bigRowBody: { flex: 1, minWidth: 0, gap: 4 },
  bigRowTitleLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  bigRowTitle: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: ink,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: "rgba(184,134,11,0.22)",
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.35)",
  },
  soonBadgeTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bigRowSub: { fontSize: fontSizes.sm, color: muted, lineHeight: 18 },
  altRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  altChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.35)",
    backgroundColor: "rgba(18,122,99,0.06)",
  },
  altChipTxt: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
  recLinkWrap: { alignItems: "center", paddingVertical: spacing.sm },
  recLink: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
  closeWrap: { alignItems: "center", paddingTop: spacing.sm, paddingBottom: spacing.xs },
  closeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0eeeb",
    borderWidth: 1,
    borderColor: border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeCirclePressed: { opacity: 0.88 },
});
