import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { postGenerateNote, type GenerateNoteBody } from "../../src/api/generateNote";
import { deenNotesListQueryKey } from "../../src/api/hooks/useDeenNotes";
import { KhutbahPlayer } from "../../src/components/KhutbahPlayer";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import type { KhutbahRecordingMeta } from "../../src/contracts/khutbah-recording";
import { NOTE_MODE_CONTRACTS } from "../../src/contracts/note-modes";
import type { NoteModeId } from "../../src/contracts/note-modes";
import { DEENNOTES_SAFETY_DISCLAIMER } from "../../src/contracts/safety-copy";
import { logFirstReflectionSavedOnce } from "../../src/lib/analytics/first-reflection-once";
import { useMobileSession } from "../../src/hooks/useMobileSession";
import { usePremium } from "../../src/hooks/usePremium";
import { composeKhutbahReflectionRawInput } from "../../src/lib/khutbah-compose";
import {
  getKhutbahRecording,
  linkKhutbahRecordingToReflection,
} from "../../src/lib/khutbah-recordings-storage";
import { generateNotePayloadForMode } from "../../src/lib/note-mode-submit";
import { captureAppIssue } from "../../src/lib/sentry/mobile";
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

const IDS = new Set(NOTE_MODE_CONTRACTS.map((m) => m.id));

function ComposeModeScreen() {
  const params = useLocalSearchParams<{ mode?: string | string[]; recordingId?: string | string[] }>();
  const router = useRouter();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const session = useMobileSession();
  const { assertAiGenerationAllowed, recordSuccessfulAiGeneration } = usePremium();

  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const recordingParamRaw = Array.isArray(params.recordingId)
    ? params.recordingId[0]
    : params.recordingId;
  const recordingIdResolved =
    typeof recordingParamRaw === "string" && recordingParamRaw.trim()
      ? recordingParamRaw.trim()
      : null;

  const raw = rawMode;
  const valid = raw && IDS.has(raw as NoteModeId);
  const id = valid ? (raw as NoteModeId) : null;
  const meta = id ? NOTE_MODE_CONTRACTS.find((m) => m.id === id) : undefined;
  const blocked = Boolean(meta?.comingSoon);

  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [khLoading, setKhLoading] = useState(false);
  const [khMeta, setKhMeta] = useState<KhutbahRecordingMeta | null>(null);

  useEffect(() => {
    if (id !== "record_khutbah") {
      setKhMeta(null);
      setKhLoading(false);
      return;
    }
    if (!recordingIdResolved) {
      setKhMeta(null);
      setKhLoading(false);
      return;
    }
    setKhLoading(true);
    let cancelled = false;
    void getKhutbahRecording(recordingIdResolved).then((m) => {
      if (cancelled) return;
      setKhMeta(m);
      setKhLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, recordingIdResolved]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: meta?.label ?? "Compose" });
  }, [navigation, meta?.label]);

  async function onSubmit(retryAttempt: boolean) {
    if (!retryAttempt) setErr(null);
    if (!id || !meta || blocked) return;

    let body: GenerateNoteBody | null = null;
    if (id === "record_khutbah") {
      if (!recordingIdResolved || !khMeta) {
        setErr("That recording could not be found on this device. Record again first.");
        return;
      }
      body = generateNotePayloadForMode(
        id,
        composeKhutbahReflectionRawInput(draft, khMeta),
      );
    } else {
      body = generateNotePayloadForMode(id, draft.trim());
    }

    if (!body) {
      setErr("This capture mode is not wired to drafting yet.");
      return;
    }

    const token = session.accessToken;
    if (!token || !supabase) {
      setErr("Sign in on this device so your reflection saves to your account.");
      return;
    }
    const allowed = await assertAiGenerationAllowed();
    if (!allowed) return;
    setSubmitting(true);
    try {
      const { noteId } = await postGenerateNote(token, body);
      if (id === "record_khutbah" && recordingIdResolved) {
        try {
          await linkKhutbahRecordingToReflection(recordingIdResolved, noteId);
        } catch {
          /* local metadata only; reflection still succeeded */
        }
      }
      await qc.invalidateQueries({ queryKey: deenNotesListQueryKey });
      await recordSuccessfulAiGeneration(id);
      void logFirstReflectionSavedOnce();
      router.replace(`/notes/${noteId}`);
    } catch (e) {
      captureAppIssue(
        "reflection_generate",
        e,
        id ? { noteType: id, hasRecording: Boolean(recordingIdResolved) } : undefined,
      );
      setErr(
        __DEV__ && e instanceof Error
          ? e.message
          : "We could not craft that reflection. Check connection and sign-in, then try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmitDraft =
    id === "record_khutbah" ? Boolean(khMeta) : Boolean(draft.trim());

  if (!session.ready) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color={emerald} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.h1}>{meta?.label ?? "Reflection"}</Text>

          {!valid ? (
            <Text style={styles.body}>Unknown capture mode. Go back and pick again.</Text>
          ) : blocked ? (
            <>
              <Text style={styles.body}>
                This mode is marked coming soon in the shared note contract. Nothing is wrong on your
                side — we&apos;ll open full capture with device-safe flows in a later drop.
              </Text>
              <Text style={styles.body}>
                You can use Paste Notes, Quran Reflection, or Personal Reminder today from the new
                reflection sheet.
              </Text>
            </>
          ) : !supabase ? (
            <Text style={styles.body}>
              Reflection saving needs EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in this
              build.
            </Text>
          ) : !session.accessToken ? (
            <>
              <Text style={styles.body}>
                Sign in to craft and save reflections to your DeenNotes account — the same library as
                the web app.
              </Text>
              <Pressable style={styles.primary} onPress={() => router.push("/login")}>
                <Text style={styles.primaryTxt}>Sign in</Text>
              </Pressable>
              <Text style={styles.disclaimer}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
            </>
          ) : id === "record_khutbah" && !recordingIdResolved ? (
            <>
              <Text style={styles.body}>
                Record the khutbah or reminder here on your phone first — audio stays offline until you
                choose to generate a reflection.
              </Text>
              <Pressable style={styles.primary} onPress={() => router.push("/recording/session")}>
                <Text style={styles.primaryTxt}>Open recorder</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={() => router.push("/recordings")}>
                <Text style={styles.secondaryTxt}>Browse saved recordings</Text>
              </Pressable>
            </>
          ) : id === "record_khutbah" && khLoading ? (
            <View style={[styles.loadingWrap, { alignItems: "center" }]}>
              <ActivityIndicator size="large" color={emerald} />
              <Text style={styles.loadingTxt}>Opening your recording…</Text>
            </View>
          ) : id === "record_khutbah" && recordingIdResolved && !khMeta ? (
            <>
              <Text style={styles.body}>
                That recording file is missing (it may have been deleted from this device). Capture again
                or pick another recording from your library.
              </Text>
              <Pressable style={styles.primary} onPress={() => router.push("/recording/session")}>
                <Text style={styles.primaryTxt}>Record again</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={() => router.push("/recordings")}>
                <Text style={styles.secondaryTxt}>Open recordings</Text>
              </Pressable>
            </>
          ) : submitting ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={emerald} />
              <Text style={styles.loadingTxt}>Crafting your reflection…</Text>
              <Text style={styles.noteSmall}>Keeping your notes private-first and aligned</Text>
              <Text style={styles.disclaimer}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.bodyMuted}>
                {id === "record_khutbah"
                  ? "Add what you remembered, or what struck your heart. You can replay the capture below — it never leaves this phone as raw audio unless you erase it locally."
                  : "Type or paste freely. Edit before saving — drafts stay on-device until they are sent."}
              </Text>
              {id === "record_khutbah" && khMeta ? (
                <>
                  <Text style={styles.attachLabel}>Recorded during this khutbah</Text>
                  <KhutbahPlayer
                    uri={khMeta.fileUri}
                    durationMillis={khMeta.durationMillis}
                    caption="No transcription yet — playback is stored only on this device."
                  />
                </>
              ) : null}
              <TextInput
                style={styles.area}
                multiline
                textAlignVertical="top"
                placeholder={
                  id === "record_khutbah"
                    ? "Optional — themes, evidences you want revisiting…"
                    : "Write what you captured or what struck your heart..."
                }
                placeholderTextColor={muted}
                value={draft}
                onChangeText={setDraft}
                editable={!submitting}
                accessibilityLabel="Reflection text"
              />
              {err ? <Text style={styles.err}>{err}</Text> : null}
              <Pressable
                style={[styles.primary, submitting && styles.primaryMuted]}
                onPress={() => void onSubmit(false)}
                disabled={submitting || !canSubmitDraft}
                accessibilityRole="button"
              >
                <Text style={styles.primaryTxt}>Craft reflection</Text>
              </Pressable>
              {err ? (
                <Pressable style={styles.secondary} onPress={() => void onSubmit(true)}>
                  <Text style={styles.secondaryTxt}>Try again</Text>
                </Pressable>
              ) : null}
              <Text style={styles.disclaimer}>{DEENNOTES_SAFETY_DISCLAIMER}</Text>
              <Text style={styles.noteSmall}>
                Type: <Text style={styles.noteMono}>{meta?.noteType ?? "—"}</Text>
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function ComposeModeScreenExported() {
  return (
    <ScreenErrorBoundary scope="compose-mode">
      <ComposeModeScreen />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  center: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: ink,
  },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22 },
  bodyMuted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  attachLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    color: bronze,
    marginTop: spacing.xs,
  },
  area: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: cardBg,
    lineHeight: 22,
  },
  err: { fontSize: fontSizes.sm, color: "#b45309", lineHeight: 20 },
  primary: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryMuted: { opacity: 0.85 },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  secondary: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  secondaryTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.sm },
  disclaimer: { fontSize: 12, color: muted, lineHeight: 18, marginTop: spacing.sm },
  noteSmall: { fontSize: 12, color: muted },
  noteMono: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", color: ink },
  loadingWrap: { gap: spacing.md, alignItems: "flex-start", paddingVertical: spacing.lg },
  loadingTxt: { fontSize: fontSizes.lg, fontWeight: "700", color: ink },
});
