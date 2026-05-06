import { Audio } from "expo-av";
import { useCallback, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import { captureAppIssue } from "../lib/sentry/mobile";

export type KhutbahRecorderPhase = "idle" | "recording" | "paused";

/**
 * Lightweight recorder for khutbah capture. Pause/resume exposed on Android (API 24+); iOS expo-av only supports pause on Android per SDK typing.
 */
export function useKhutbahRecorder(): {
  phase: KhutbahRecorderPhase;
  elapsedMs: number;
  permissionDenied: boolean;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<{ uri: string | null; durationMillis: number }>;
  discard: () => Promise<void>;
  supportsPauseResume: boolean;
} {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [phase, setPhase] = useState<KhutbahRecorderPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const supportsPauseResume = Platform.OS === "android";

  const discard = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        /* already unloaded or too short */
      }
    }
    setPhase("idle");
    setElapsedMs(0);
  }, []);

  const start = useCallback(async () => {
    setPermissionDenied(false);
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      setPermissionDenied(true);
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    if (recordingRef.current) return;

    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (!status.isRecording) return;
          if (typeof status.durationMillis === "number") {
            setElapsedMs(status.durationMillis);
          }
        },
        280,
      );
      recordingRef.current = recording;
      setElapsedMs(0);
      setPhase("recording");
    } catch (err) {
      captureAppIssue("khutbah_record_start", err);
      Alert.alert("Could not start", "Microphone recording failed to start. Try again briefly.");
      await discard();
    }
  }, [discard]);

  const pause = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec || phase !== "recording") return;
    if (!supportsPauseResume) return;
    try {
      await rec.pauseAsync();
      setPhase("paused");
    } catch {
      Alert.alert("Pause unavailable", "On this device, use Stop when you have captured enough.");
    }
  }, [phase, supportsPauseResume]);

  const resume = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec || phase !== "paused") return;
    try {
      await rec.startAsync();
      setPhase("recording");
    } catch {
      Alert.alert("Could not resume", "Please stop and save, or discard and record again.");
    }
  }, [phase]);

  const stop = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) {
      setPhase("idle");
      return { uri: null, durationMillis: elapsedMs };
    }
    try {
      const status = await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      const dur =
        typeof status.durationMillis === "number" ? status.durationMillis : elapsedMs;
      setPhase("idle");
      setElapsedMs(0);
      return { uri, durationMillis: dur };
    } catch (err) {
      captureAppIssue("khutbah_record_stop", err);
      Alert.alert(
        "Recording interrupted",
        "The file could not be finalized. Keep this screen open and try a shorter capture.",
      );
      setPhase("idle");
      setElapsedMs(0);
      return { uri: null, durationMillis: elapsedMs };
    }
  }, [elapsedMs]);

  return {
    phase,
    elapsedMs,
    permissionDenied,
    start,
    pause,
    resume,
    stop,
    discard,
    supportsPauseResume,
  };
}
