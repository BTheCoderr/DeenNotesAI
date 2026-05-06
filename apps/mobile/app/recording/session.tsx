import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useKhutbahRecorder } from "../../src/hooks/useKhutbahRecorder";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { formatDurationShort } from "../../src/lib/khutbah-compose";
import { commitKhutbahRecording } from "../../src/lib/khutbah-recordings-storage";
import { safeBack } from "../../src/lib/navigation/safe-back";
import { usePremium } from "../../src/hooks/usePremium";
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

const BAR_HEIGHTS = [5, 9, 14, 7, 16, 10, 6, 12, 8, 11, 6, 13, 9, 7];

function WaveformPlaceholder({ active }: { active: boolean }) {
  return (
    <View style={styles.waveRow} accessibilityLabel="Waveform placeholder">
      {BAR_HEIGHTS.map((h, i) => (
        <View
          key={`wave-${i}-${h}`}
          style={[
            styles.waveBar,
            {
              height: h,
              opacity: active ? 0.4 : 0.14,
            },
          ]}
        />
      ))}
    </View>
  );
}

function KhutbahRecordingSessionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const premium = usePremium();
  const {
    phase,
    elapsedMs,
    permissionDenied,
    start,
    pause,
    resume,
    stop,
    discard,
    supportsPauseResume,
  } = useKhutbahRecorder();

  const [saving, setSaving] = useState(false);

  const active = phase === "recording" || phase === "paused";

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Khutbah" });
  }, [navigation]);

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (phase === "idle") return;
      e.preventDefault();
      const leave = e.data?.action;
      Alert.alert(
        "Leave without saving?",
        "This will discard the current capture. Nothing is uploaded.",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              void (async () => {
                await discard();
                if (leave) navigation.dispatch(leave);
              })();
            },
          },
        ],
      );
    });
    return sub;
  }, [navigation, phase, discard]);

  const onStopAndSave = useCallback(async () => {
    if (phase === "idle") return;
    setSaving(true);
    try {
      const { uri, durationMillis } = await stop();
      if (!uri) {
        Alert.alert("Could not save", "No audio file was created. Try recording again.");
        return;
      }
      const meta = await commitKhutbahRecording({
        tempFileUri: uri,
        durationMillis,
      });
      router.replace(`/compose/record_khutbah?recordingId=${encodeURIComponent(meta.id)}`);
    } catch {
      Alert.alert("Could not save", "We could not copy the recording to your library.");
    } finally {
      setSaving(false);
    }
  }, [phase, stop, router]);

  const hint = useMemo(() => {
    if (permissionDenied) {
      return "Microphone access is off. Enable it in Settings to capture here.";
    }
    if (!supportsPauseResume && Platform.OS === "ios") {
      return "On iPhone, recording runs until you stop — keep the app open, then save when you are ready.";
    }
    if (!supportsPauseResume && Platform.OS === "android") {
      return "Recording stops if you leave this screen — stay here until you stop & save.";
    }
    if (supportsPauseResume) {
      return "Pause if you need a quiet moment; resume when the speaker continues.";
    }
    return "Capture what you can; you can add written notes when you craft the reflection.";
  }, [permissionDenied, supportsPauseResume]);

  const gateRecording =
    premium.purchasesAvailable && premium.isHydrated && !premium.isPremium;

  if (!premium.isHydrated) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]} edges={["top", "bottom", "left", "right"]}>
        <ActivityIndicator size="large" color={emerald} />
      </SafeAreaView>
    );
  }

  if (gateRecording) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.inner}>
          <Text style={styles.overline}>DeenNotes Plus</Text>
          <Text style={styles.title}>Khutbah recording</Text>
          <Text style={styles.lead}>
            Local-first khutbah capture and crafting stays with subscribers so we can steward storage, transcripts, and
            privacy thoughtfully.
          </Text>
          <Pressable style={styles.primary} onPress={() => premium.openPaywall("khutbah_recording")}>
            <Text style={styles.primaryTxt}>Explore Plus calmly</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={() => safeBack(router, navigation, "/new-sheet")}>
            <Text style={styles.ghostTxt}>Return to New reflection</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.inner}>
        <Text style={styles.overline}>Local only</Text>
        <Text style={styles.title}>Listen, then save</Text>
        <Text style={styles.lead}>{hint}</Text>

        <View style={styles.card}>
          <WaveformPlaceholder active={phase === "recording"} />
          <Text style={styles.timer} accessibilityLabel="Elapsed recording time">
            {formatDurationShort(elapsedMs)}
          </Text>
        </View>

        {phase === "idle" ? (
          <Pressable
            style={styles.primary}
            onPress={() => void start()}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Start recording"
          >
            <Text style={styles.primaryTxt}>Begin capture</Text>
          </Pressable>
        ) : (
          <View style={styles.row}>
            {supportsPauseResume ? (
              phase === "recording" ? (
                <Pressable style={styles.secondary} onPress={() => void pause()}>
                  <Text style={styles.secondaryTxt}>Pause</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.secondary} onPress={() => void resume()}>
                  <Text style={styles.secondaryTxt}>Resume</Text>
                </Pressable>
              )
            ) : null}
            <Pressable
              style={[styles.primary, styles.primaryGrow]}
              onPress={() => void onStopAndSave()}
              disabled={saving}
            >
              <Text style={styles.primaryTxt}>{saving ? "Saving…" : "Stop & save"}</Text>
            </Pressable>
          </View>
        )}

        {active ? (
          <Pressable
            style={styles.ghost}
            onPress={() => {
              Alert.alert("Discard capture?", "The audio will not be kept.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Discard",
                  style: "destructive",
                  onPress: () => void discard(),
                },
              ]);
            }}
          >
            <Text style={styles.ghostTxt}>Discard</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.ghost} onPress={() => safeBack(router, navigation, "/(tabs)")}>
            <Text style={styles.ghostTxt}>Close</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function KhutbahRecordingSessionScreenExported() {
  return (
    <ScreenErrorBoundary scope="recording-session">
      <KhutbahRecordingSessionScreen />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  inner: { flex: 1, padding: spacing.xl, gap: spacing.lg },
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: fontSerifHeading,
    fontSize: 26,
    color: ink,
    lineHeight: 32,
  },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  card: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.lg,
    backgroundColor: cardBg,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 5,
    height: 40,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: ink,
  },
  timer: {
    fontSize: 36,
    fontVariant: ["tabular-nums"],
    color: ink,
    fontWeight: "600",
  },
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "stretch" },
  primary: {
    alignSelf: "stretch",
    backgroundColor: emerald,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryGrow: { flex: 1 },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  secondary: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    justifyContent: "center",
    backgroundColor: cardBg,
  },
  secondaryTxt: { color: ink, fontWeight: "800", fontSize: fontSizes.md },
  ghost: { alignSelf: "center", paddingVertical: spacing.md, minHeight: 44, justifyContent: "center" },
  ghostTxt: { color: muted, fontWeight: "700", fontSize: fontSizes.sm },
});
