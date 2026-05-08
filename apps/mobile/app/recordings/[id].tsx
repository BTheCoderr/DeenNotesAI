import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KhutbahPlayer } from "../../src/components/KhutbahPlayer";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import {
  deleteKhutbahRecording,
  getKhutbahRecording,
  updateKhutbahRecordingTitle,
} from "../../src/lib/khutbah-recordings-storage";
import { safeBack } from "../../src/lib/navigation/safe-back";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function RecordingDetailScreenInner() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const raw = params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  const [meta, setMeta] = useState<Awaited<ReturnType<typeof getKhutbahRecording>>>(null);
  const [titleEdit, setTitleEdit] = useState("");

  useEffect(() => {
    let alive = true;
    void getKhutbahRecording(id ?? "").then((m) => {
      if (!alive) return;
      setMeta(m);
      setTitleEdit(m?.title ?? "");
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: titleEdit.trim() || "Recording" });
  }, [navigation, titleEdit]);

  async function persistTitle() {
    if (!id) return;
    const t = titleEdit.trim();
    await updateKhutbahRecordingTitle(id, t || undefined);
    const next = await getKhutbahRecording(id);
    setMeta(next);
  }

  function confirmDelete() {
    if (!id) return;
    Alert.alert("Remove recording?", "The audio file will be deleted from this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          void (async () => {
            await deleteKhutbahRecording(id);
            safeBack(router, navigation, "/recordings");
          })(),
      },
    ]);
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Missing recording id.</Text>
      </SafeAreaView>
    );
  }

  if (!meta) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Gathering that capture from memory…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <Text style={styles.overline}>Local recording</Text>
        <Text style={styles.when}>{formatWhen(meta.createdAt)}</Text>

        <TextInput
          style={styles.input}
          placeholder="Optional title — e.g. Jumuah khutbah"
          placeholderTextColor={muted}
          value={titleEdit}
          onChangeText={setTitleEdit}
          onEndEditing={() => void persistTitle()}
        />

        <KhutbahPlayer uri={meta.fileUri} durationMillis={meta.durationMillis} />

        {meta.linkedReflectionId ? (
          <Pressable
            style={styles.linkReflect}
            onPress={() => router.push(`/notes/${meta.linkedReflectionId}`)}
          >
            <Text style={styles.linkReflectTxt}>Open linked reflection</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.primary}
            onPress={() =>
              router.push(`/compose/record_khutbah?recordingId=${encodeURIComponent(meta.id)}`)
            }
          >
            <Text style={styles.primaryTxt}>Craft reflection</Text>
          </Pressable>
        )}

        <Pressable style={styles.danger} onPress={confirmDelete}>
          <Text style={styles.dangerTxt}>Delete recording</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function RecordingDetailScreen() {
  return (
    <ScreenErrorBoundary scope="recording-detail">
      <RecordingDetailScreenInner />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  pad: { padding: spacing.xl, paddingBottom: 48, gap: spacing.md },
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  when: { fontSize: fontSizes.sm, color: muted },
  muted: { fontSize: fontSizes.sm, color: muted, padding: spacing.xl },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: cardBg,
  },
  primary: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  linkReflect: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  linkReflectTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.md },
  danger: { alignSelf: "flex-start", paddingVertical: spacing.md },
  dangerTxt: { color: "#8b2942", fontWeight: "700", fontSize: fontSizes.sm },
});
