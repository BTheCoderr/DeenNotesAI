import { Audio, type AVPlaybackStatus } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDurationShort } from "../lib/khutbah-compose";
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
} from "../theme";

type Props = {
  uri: string;
  durationMillis: number;
  /** Optional subtitle e.g. "Recorded during this khutbah" */
  caption?: string;
};

export function KhutbahPlayer({ uri, durationMillis, caption }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [positionMs, setPositionMs] = useState(0);
  const [duration, setDuration] = useState(durationMillis);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [trackWidth, setTrackWidth] = useState(1);

  const onStatusUpdate = useCallback((s: AVPlaybackStatus) => {
    if (!s.isLoaded) return;
    setPositionMs(s.positionMillis ?? 0);
    if (typeof s.durationMillis === "number" && s.durationMillis > 0) {
      setDuration(s.durationMillis);
    }
    setPlaying(s.isPlaying ?? false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, onStatusUpdate);
      if (cancelled) {
        await sound.unloadAsync();
        return;
      }
      soundRef.current = sound;
    })();
    return () => {
      cancelled = true;
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [uri, onStatusUpdate]);

  async function togglePlay() {
    const s = soundRef.current;
    if (!s || busy) return;
    setBusy(true);
    try {
      const st = await s.getStatusAsync();
      if (st.isLoaded && st.isPlaying) await s.pauseAsync();
      else await s.playAsync();
    } finally {
      setBusy(false);
    }
  }

  async function seekToRatio(ratio: number) {
    const s = soundRef.current;
    if (!s || duration <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const nextMs = clamped * duration;
    await s.setPositionAsync(nextMs);
  }

  async function skip(deltaMs: number) {
    const s = soundRef.current;
    if (!s || duration <= 0) return;
    const next = Math.max(0, Math.min(duration, positionMs + deltaMs));
    await s.setPositionAsync(next);
  }

  const progress = duration > 0 ? positionMs / duration : 0;

  return (
    <View style={styles.card}>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      <View style={styles.row}>
        <Pressable style={styles.mainBtn} onPress={() => void togglePlay()} disabled={busy}>
          <Text style={styles.mainBtnTxt}>{playing ? "Pause" : "Play"}</Text>
        </Pressable>
        <Text style={styles.time}>
          {formatDurationShort(positionMs)} · {formatDurationShort(duration)}
        </Text>
      </View>

      <Pressable
        onLayout={(e: LayoutChangeEvent) => setTrackWidth(Math.max(1, e.nativeEvent.layout.width))}
        style={styles.trackWrap}
        onPress={(evt) => {
          const x = evt.nativeEvent.locationX;
          void seekToRatio(x / trackWidth);
        }}
        accessibilityRole="adjustable"
        accessibilityLabel="Seek recording"
      >
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
        </View>
      </Pressable>

      <View style={styles.skipRow}>
        <Pressable style={styles.ghostSkip} onPress={() => void skip(-15_000)}>
          <Text style={styles.ghostSkipTxt}>−15s</Text>
        </Pressable>
        <Pressable style={styles.ghostSkip} onPress={() => void skip(15_000)}>
          <Text style={styles.ghostSkipTxt}>+15s</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  caption: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  mainBtn: {
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 44,
    justifyContent: "center",
  },
  mainBtnTxt: { color: "#fff", fontWeight: "700", fontSize: fontSizes.sm },
  time: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: bronze,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
  },
  trackWrap: { paddingVertical: spacing.sm },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: emerald,
    opacity: 0.75,
    borderRadius: radii.pill,
  },
  skipRow: { flexDirection: "row", justifyContent: "center", gap: spacing.md },
  ghostSkip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44 },
  ghostSkipTxt: { color: ink, fontWeight: "700", fontSize: fontSizes.sm },
});
