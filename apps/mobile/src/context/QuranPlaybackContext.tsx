import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FALLBACK_MOBILE_RECITER_ID, fetchVerseAudio } from "../api/quran";
import { mobileTabFloatingBottomOffset } from "../lib/layout/tab-bar";
import { logProductEvent } from "../lib/analytics/mobile-product-events";
import { getAudioCacheRow } from "../lib/quran/audio-cache";
import {
  clearLastRecitation,
  readLastRecitation,
  writeLastRecitation,
  type LastRecitationPersisted,
} from "../lib/quran/last-recitation-storage";
import { readMobileQuranPrefs } from "../lib/mobile-quran-prefs";
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
  minTouchTarget,
} from "../theme";

type PlayArgs = {
  surahId: number;
  ayah: number;
  verseCount: number;
  reciterId?: string;
  resumeFromStorage?: boolean;
  chapterTitle?: string;
};

export type QuranPlaybackCtx = {
  reciterIdEffective: string;
  playVerse: (args: PlayArgs) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  nextVerse: () => Promise<void>;
  prevVerse: () => Promise<void>;
  busy: boolean;
  playing: boolean;
  current: null | {
    surahId: number;
    ayah: number;
    verseCount: number;
    chapterTitle?: string;
  };
  /** True when the floating mini strip should reserve list space (playing / paused with an active track). */
  hasActiveMiniStrip: boolean;
  /** Hides the mini strip without stopping audio; does not clear saved last recitation. */
  dismissMiniStrip: () => void;
  lastRecitationHint: LastRecitationPersisted | null;
  reloadLastRecitation: () => Promise<void>;
};

const Ctx = createContext<QuranPlaybackCtx | null>(null);

async function applyQuranAudioSession() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

function useDebouncedPersist(
  current: QuranPlaybackCtx["current"],
  playing: boolean,
  reciterId: string,
  getStatus: () => Promise<AVPlaybackStatus>,
) {
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!current || !playing) {
      if (ref.current) clearInterval(ref.current);
      ref.current = null;
      return;
    }
    const tick = async () => {
      const st = await getStatus();
      if (!st.isLoaded) return;
      const pos = st.positionMillis ?? 0;
      const dur =
        typeof st.durationMillis === "number" && st.durationMillis > 0
          ? st.durationMillis
          : undefined;
      void writeLastRecitation({
        reciterId,
        surahId: current.surahId,
        ayah: current.ayah,
        positionMillis: pos,
        durationMillis: dur,
        updatedAt: Date.now(),
        verseCount: current.verseCount,
      });
    };
    ref.current = setInterval(() => void tick(), 2600);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [current, playing, reciterId, getStatus]);
}

export function QuranPlaybackProvider({ children }: { children: ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const reciterRef = useRef(FALLBACK_MOBILE_RECITER_ID);
  const [reciterIdEffective, setReciterIdEffective] = useState(FALLBACK_MOBILE_RECITER_ID);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<QuranPlaybackCtx["current"]>(null);
  const [miniStripDismissed, setMiniStripDismissed] = useState(false);
  const [lastHint, setLastHint] = useState<LastRecitationPersisted | null>(null);

  const reloadLastRecitation = useCallback(async () => {
    setLastHint(await readLastRecitation());
  }, []);

  const dismissMiniStrip = useCallback(() => {
    setMiniStripDismissed(true);
  }, []);

  useEffect(() => {
    void reloadLastRecitation();
    void readMobileQuranPrefs().then((p) => {
      const r = (p.reciterId?.trim() || FALLBACK_MOBILE_RECITER_ID) as string;
      reciterRef.current = r;
      setReciterIdEffective(r);
    });
  }, [reloadLastRecitation]);

  const unload = useCallback(async () => {
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      try {
        await s.unloadAsync();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const getStatusCb = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return {} as AVPlaybackStatus;
    return s.getStatusAsync();
  }, []);

  useDebouncedPersist(current, playing, reciterIdEffective, getStatusCb);

  const attachSound = useCallback(
    async (uri: string, resumeMs?: number) => {
      await unload();
      await applyQuranAudioSession();
      const initialPos = resumeMs && resumeMs > 500 ? resumeMs : 0;
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, positionMillis: initialPos },
        (st) => {
          if (!st.isLoaded) return;
          setPlaying(Boolean(st.isPlaying));
        },
      );
      soundRef.current = sound;
    },
    [unload],
  );

  const playVerse = useCallback(
    async (args: PlayArgs) => {
      setMiniStripDismissed(false);
      const reciter = (args.reciterId?.trim() ||
        reciterRef.current ||
        FALLBACK_MOBILE_RECITER_ID) as string;
      reciterRef.current = reciter;
      setReciterIdEffective(reciter);
      setBusy(true);
      try {
        let resumeMs: number | undefined;
        if (args.resumeFromStorage) {
          const last = await readLastRecitation();
          if (
            last &&
            last.surahId === args.surahId &&
            last.ayah === args.ayah &&
            last.reciterId === reciter
          ) {
            resumeMs = last.positionMillis;
          }
        }

        const row = await getAudioCacheRow(reciter, args.surahId, args.ayah);
        logProductEvent("quran_listen_start", {
          playback_source: row?.status === "ready" && row.localUri ? "cache" : "stream",
        });
        if (row?.status === "ready" && row.localUri) {
          await attachSound(row.localUri, resumeMs);
        } else {
          const meta = await fetchVerseAudio(args.surahId, args.ayah, reciter);
          await attachSound(meta.audioUrl, resumeMs);
        }
        setCurrent({
          surahId: args.surahId,
          ayah: args.ayah,
          verseCount: args.verseCount,
          chapterTitle: args.chapterTitle,
        });
        void writeLastRecitation({
          reciterId: reciter,
          surahId: args.surahId,
          ayah: args.ayah,
          positionMillis: resumeMs ?? 0,
          updatedAt: Date.now(),
          verseCount: args.verseCount,
        });
        void reloadLastRecitation();
      } finally {
        setBusy(false);
      }
    },
    [attachSound, reloadLastRecitation],
  );

  const pause = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    const st = await s.getStatusAsync();
    if (st.isLoaded && st.isPlaying) await s.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    setMiniStripDismissed(false);
    const s = soundRef.current;
    if (!s) return;
    await s.playAsync();
  }, []);

  const stop = useCallback(async () => {
    setPlaying(false);
    setCurrent(null);
    setMiniStripDismissed(false);
    await unload();
    void clearLastRecitation();
    void reloadLastRecitation();
  }, [unload, reloadLastRecitation]);

  const nextVerse = useCallback(async () => {
    if (!current) return;
    if (current.ayah >= current.verseCount) return;
    await playVerse({
      surahId: current.surahId,
      ayah: current.ayah + 1,
      verseCount: current.verseCount,
      chapterTitle: current.chapterTitle,
    });
  }, [current, playVerse]);

  const prevVerse = useCallback(async () => {
    if (!current) return;
    if (current.ayah <= 1) return;
    await playVerse({
      surahId: current.surahId,
      ayah: current.ayah - 1,
      verseCount: current.verseCount,
      chapterTitle: current.chapterTitle,
    });
  }, [current, playVerse]);

  const hasActiveMiniStrip = Boolean(current) && !miniStripDismissed;

  const value = useMemo<QuranPlaybackCtx>(
    () => ({
      reciterIdEffective,
      playVerse,
      pause,
      resume,
      stop,
      nextVerse,
      prevVerse,
      busy,
      playing,
      current,
      hasActiveMiniStrip,
      dismissMiniStrip,
      lastRecitationHint: lastHint,
      reloadLastRecitation,
    }),
    [
      reciterIdEffective,
      playVerse,
      pause,
      resume,
      stop,
      nextVerse,
      prevVerse,
      busy,
      playing,
      current,
      hasActiveMiniStrip,
      dismissMiniStrip,
      lastHint,
      reloadLastRecitation,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <QuranMiniPlayerStrip />
    </Ctx.Provider>
  );
}

export function useQuranPlayback(): QuranPlaybackCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useQuranPlayback requires QuranPlaybackProvider");
  return v;
}

/** Horizontal padding matches floating placement (16px). */
const FLOAT_H_PAD = 16;

function QuranMiniPlayerStrip() {
  const v = useContext(Ctx);
  const insets = useSafeAreaInsets();
  if (!v) return null;

  const {
    current,
    playing,
    busy,
    pause,
    resume,
    stop,
    nextVerse,
    prevVerse,
    hasActiveMiniStrip,
    dismissMiniStrip,
  } = v;

  if (!current || !hasActiveMiniStrip) return null;

  const bottomLift = mobileTabFloatingBottomOffset(insets.bottom, 12);

  return (
    <View style={[stripStyles.miniWrap, { bottom: bottomLift, paddingHorizontal: FLOAT_H_PAD }]} pointerEvents="box-none">
      <View style={stripStyles.miniCard}>
        <View style={stripStyles.headRow}>
          <View style={stripStyles.titleBlk}>
            <Text style={stripStyles.miniK} numberOfLines={1}>
              {current.chapterTitle ? current.chapterTitle : `Surah ${current.surahId}`}
            </Text>
            <Text style={stripStyles.miniT} numberOfLines={1}>
              Ayah {current.ayah} of {current.verseCount}
            </Text>
          </View>
          <View style={stripStyles.headRight}>
            {busy ? <ActivityIndicator color={emerald} size="small" /> : null}
            <Pressable
              onPress={dismissMiniStrip}
              style={stripStyles.iconHit}
              accessibilityRole="button"
              accessibilityLabel="Hide Quran player strip"
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={muted} />
            </Pressable>
          </View>
        </View>
        <Text style={stripStyles.miniS}>Recitation continues when supported.</Text>

        <View style={stripStyles.ctrlRow}>
          <Pressable
            onPress={() => void prevVerse()}
            style={stripStyles.ctrlBtn}
            disabled={current.ayah <= 1}
          >
            <Text style={stripStyles.ctrlTxt}>Prev</Text>
          </Pressable>
          <Pressable
            onPress={() => void (playing ? pause() : resume())}
            style={stripStyles.ctrlBtnPrimary}
          >
            <Text style={stripStyles.ctrlTxtPrimary}>{playing ? "Pause" : "Play"}</Text>
          </Pressable>
          <Pressable
            onPress={() => void nextVerse()}
            style={stripStyles.ctrlBtn}
            disabled={current.ayah >= current.verseCount}
          >
            <Text style={stripStyles.ctrlTxt}>Next</Text>
          </Pressable>
          <Pressable onPress={() => void stop()} style={stripStyles.ctrlBtn}>
            <Text style={stripStyles.ctrlTxt}>Stop</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const stripStyles = StyleSheet.create({
  miniWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  miniCard: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleBlk: { flex: 1, minWidth: 0 },
  headRight: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  iconHit: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  miniK: { fontSize: fontSizes.xs, fontWeight: "800", color: bronze },
  miniT: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
  miniS: { fontSize: fontSizes.xs, color: muted, lineHeight: 17 },
  ctrlRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  ctrlBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
    minHeight: minTouchTarget,
    justifyContent: "center",
  },
  ctrlTxt: { fontWeight: "700", color: ink, fontSize: fontSizes.xs },
  ctrlBtnPrimary: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: emerald,
    minHeight: minTouchTarget,
    justifyContent: "center",
  },
  ctrlTxtPrimary: { fontWeight: "800", color: "#fff", fontSize: fontSizes.xs },
});
