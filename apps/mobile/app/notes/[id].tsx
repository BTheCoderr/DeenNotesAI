import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { DeenNoteRow } from "../../src/api/hooks/useDeenNotes";
import { useDeenNote } from "../../src/api/hooks/useDeenNotes";
import { KhutbahPlayer } from "../../src/components/KhutbahPlayer";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import type { KhutbahRecordingMeta } from "../../src/contracts/khutbah-recording";
import { labelForNoteType } from "../../src/contracts/note-types";
import { useMobileSession } from "../../src/hooks/useMobileSession";
import { formatQuranRefs, useStringLines } from "../../src/lib/note-display";
import { findRecordingForReflection } from "../../src/lib/khutbah-recordings-storage";
import { readReflectionLibrary, type ReflectionLibraryItem } from "../../src/lib/reflection-library";
import { supabase } from "../../src/lib/supabase";
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
  stone,
} from "../../src/theme";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function plainTextFromNote(note: DeenNoteRow): string {
  const lines: string[] = [];
  lines.push(note.title);
  const sum = (note.summary ?? note.short_summary ?? "").trim();
  if (sum) {
    lines.push("");
    lines.push(sum);
  }
  const rm = (note.main_reminder ?? "").trim();
  if (rm) {
    lines.push("");
    lines.push("Main reminder");
    lines.push(rm);
  }
  const appendSection = (title: string, items: string[]) => {
    if (!items.length) return;
    lines.push("");
    lines.push(title);
    for (const li of items) lines.push(`• ${li}`);
  };
  appendSection("Key reminders", stringLines(note.key_reminders));
  appendSection("Action steps", stringLines(note.action_steps));
  appendSection("Duas", stringLines(note.dua_prompts));
  appendSection("Reflection questions", stringLines(note.reflection_questions));
  const q = formatQuranRefs(note.quran_refs);
  if (q.length) {
    lines.push("");
    lines.push("Quran references");
    for (const li of q) lines.push(`• ${li}`);
  }
  return lines.join("\n");
}

function stringLines(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const x of value) {
    if (typeof x === "string" && x.trim()) out.push(x.trim());
  }
  return out;
}

function Section({ title, lines }: { title: string; lines: string[] }) {
  if (!lines.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {lines.map((line, i) => (
        <Text key={`${title}:${i}:${line}`} style={styles.bullet}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const auth = useMobileSession();
  const nid = Array.isArray(id) ? id[0] : id;

  const [localLib, setLocalLib] = useState<ReflectionLibraryItem[]>([]);
  const [khAttach, setKhAttach] = useState<KhutbahRecordingMeta | null>(null);
  useEffect(() => {
    void readReflectionLibrary().then(setLocalLib);
  }, [nid]);

  useEffect(() => {
    if (!nid) {
      setKhAttach(null);
      return;
    }
    void findRecordingForReflection(nid).then(setKhAttach);
  }, [nid]);

  const hasSignedIn = Boolean(auth.ready && supabase && auth.accessToken);
  const noteQuery = useDeenNote(nid, hasSignedIn);
  const localItem = nid ? localLib.find((x) => x.id === nid) : undefined;

  const note = noteQuery.data;
  const cloudMissing = Boolean(nid) && hasSignedIn && noteQuery.isSuccess && note == null;
  const cloudFailed = Boolean(nid) && hasSignedIn && noteQuery.isError;

  useLayoutEffect(() => {
    const t = note?.title ?? localItem?.title;
    navigation.setOptions({ title: t ? t.slice(0, 48) : "Reflection" });
  }, [navigation, note?.title, localItem?.title]);

  const keyReminders = useStringLines(note?.key_reminders);
  const actionSteps = useStringLines(note?.action_steps);
  const duas = useStringLines(note?.dua_prompts);
  const questions = useStringLines(note?.reflection_questions);
  const quranLines = useMemo(() => (note ? formatQuranRefs(note.quran_refs) : []), [note]);

  async function onCopy() {
    if (!note) return;
    await Clipboard.setStringAsync(plainTextFromNote(note));
  }

  async function onShare() {
    if (!note) return;
    await Share.share({ message: plainTextFromNote(note), title: note.title });
  }

  if (!auth.ready) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color={emerald} />
      </SafeAreaView>
    );
  }

  if (hasSignedIn && noteQuery.isPending) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color={emerald} />
        <Text style={styles.hint}>Opening your reflection…</Text>
      </SafeAreaView>
    );
  }

  if (note) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.typeLine}>
            {note.note_type ? labelForNoteType(note.note_type) : "Reflection"}
          </Text>
          <Text style={styles.dateLine}>{formatDate(note.created_at)}</Text>

          {khAttach ? (
            <View style={styles.audioAttach}>
              <Text style={styles.audioAttachLbl}>Recorded during this khutbah</Text>
              <KhutbahPlayer uri={khAttach.fileUri} durationMillis={khAttach.durationMillis} />
            </View>
          ) : null}

          <Text style={styles.h1}>{note.title}</Text>

          {(note.summary ?? note.short_summary)?.trim() ? (
            <Text style={styles.summary}>{note.summary ?? note.short_summary}</Text>
          ) : null}

          {note.main_reminder?.trim() ? (
            <>
              <Text style={styles.sectionTitle}>Main reminder</Text>
              <Text style={styles.summary}>{note.main_reminder}</Text>
            </>
          ) : null}

          <Section title="Key reminders" lines={keyReminders} />
          <Section title="Action steps" lines={actionSteps} />
          <Section title="Duas" lines={duas} />
          <Section title="Reflection questions" lines={questions} />

          <Section title="Quran references" lines={quranLines} />

          {(note.share_card_text ?? "").trim() ? (
            <View style={styles.cardShare}>
              <Text style={styles.sectionTitle}>Share card</Text>
              <Text style={styles.shareCard}>{note.share_card_text}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => void onShare()}>
              <Text style={styles.actionTxt}>Share</Text>
            </Pressable>
            <Pressable style={styles.actionBtnSecondary} onPress={() => void onCopy()}>
              <Text style={styles.actionTxtSecondary}>Copy</Text>
            </Pressable>
          </View>

          <Text style={styles.disclaimer}>{note.disclaimer}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{localItem?.title ?? "Reflection"}</Text>
        <Text style={styles.mono}>#{nid ?? "—"}</Text>
        {localItem?.short_summary || localItem?.main_reminder ? (
          <Text style={styles.summary}>
            {localItem.main_reminder ?? localItem.short_summary}
          </Text>
        ) : (
          <Text style={styles.body}>
            {cloudFailed
              ? "We could not load this reflection. Check your connection and try again."
              : cloudMissing
                ? "We could not find this reflection. It may have been removed or you may need to sign in on the account that created it."
                : "Sign in to load reflections from your account, or open a note you saved on this device."}
          </Text>
        )}
        {hasSignedIn && (cloudFailed || cloudMissing) ? (
          <Pressable style={styles.retry} onPress={() => void noteQuery.refetch()}>
            <Text style={styles.retryTxt}>Retry</Text>
          </Pressable>
        ) : null}
        {!hasSignedIn ? (
          <Pressable style={styles.primary} onPress={() => router.push("/login")}>
            <Text style={styles.primaryTxt}>Sign in</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.ghost} onPress={() => router.push("/new-sheet")}>
          <Text style={styles.ghostTxt}>New reflection</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function NoteDetailScreenExported() {
  return (
    <ScreenErrorBoundary scope="note-detail">
      <NoteDetailScreen />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  center: { justifyContent: "center", alignItems: "center", gap: spacing.md },
  pad: { padding: spacing.xl, paddingBottom: 120, gap: spacing.md },
  hint: { fontSize: fontSizes.sm, color: muted },
  typeLine: { fontSize: 10, fontWeight: "800", color: bronze, textTransform: "uppercase" },
  dateLine: { fontSize: fontSizes.xs, color: muted, marginBottom: spacing.xs },
  audioAttach: { gap: spacing.sm, marginBottom: spacing.sm },
  audioAttachLbl: { fontSize: fontSizes.sm, fontWeight: "800", color: bronze },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 26,
    fontWeight: "600",
    color: ink,
    lineHeight: 32,
  },
  mono: { fontSize: fontSizes.sm, color: muted },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
  summary: { fontSize: fontSizes.md, color: ink, lineHeight: 22 },
  section: { gap: 6 },
  sectionTitle: { fontSize: fontSizes.sm, fontWeight: "800", color: bronze, marginTop: spacing.sm },
  bullet: { fontSize: fontSizes.md, color: ink, lineHeight: 22 },
  cardShare: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: cardBg,
    gap: spacing.sm,
  },
  shareCard: { fontSize: fontSizes.md, color: ink, lineHeight: 22, fontStyle: "italic" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  actionTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  actionBtnSecondary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: cardBg,
  },
  actionTxtSecondary: { color: emerald, fontWeight: "800", fontSize: fontSizes.md },
  disclaimer: { fontSize: 11, color: muted, lineHeight: 16, marginTop: spacing.lg },
  retry: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  retryTxt: { color: "#fff", fontWeight: "800" },
  primary: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
    marginTop: spacing.md,
  },
  primaryTxt: { color: "#fff", fontWeight: "800" },
  ghost: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
    justifyContent: "center",
  },
  ghostTxt: { fontWeight: "700", color: emerald, fontSize: fontSizes.md },
});
