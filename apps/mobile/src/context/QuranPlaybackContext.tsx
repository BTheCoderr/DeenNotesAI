import { Ionicons } from "@expo/vector-icons";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
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
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FALLBACK_MOBILE_RECITER_ID, fetchVerseAudio } from "../api/quran";
import {
  logAppStateTransition,
  logAudioModeApplied,
  logPlaybackStatusTransition,
  logRuntimeEnvironmentOnce,
  logUnload,
} from "../lib/quran/quran-playback-diagnostics";
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
import { readRecitersSnapshot } from "../lib/reciters-snapshot-storage";
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

const FRIENDLY_PLAYBACK_UNAVAILABLE =
  "Could not play this recitation. Check your connection and try again.";

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
  /** User-facing playback failure (bad URL / lost network buffer / load error). Cleared on new play/stop. */
  playbackError: string | null;
  clearPlaybackError: () => void;
  current: null | {
    surahId: number;
    ayah: number;
    verseCount: number;
    chapterTitle?: string;
    reciterLabel?: string;
  };
  /** True when the floating mini strip should reserve list space (playing / paused with an active track). */
  hasActiveMiniStrip: boolean;
  /** Hides the mini strip without stopping audio; does not clear saved last recitation. */
  dismissMiniStrip: () => void;
  lastRecitationHint: LastRecitationPersisted | null;
  reloadLastRecitation: () => Promise<void>;
};

const Ctx = createContext<QuranPlaybackCtx | null>(null);

async function resolveReciterDisplayName(reciterId: string): Promise<string | undefined> {
  const snap = await readRecitersSnapshot();
  if (!snap?.items?.length) return undefined;
  const num = Number(reciterId);
  const row = snap.items.find((r) => r.id === num || String(r.id) === reciterId);
  if (!row) return undefined;
  return row.translatedName ?? row.reciterName ?? row.style;
}

/**
 * Quran playback-only session: mic stays disabled, duck other audio on iOS, keep session alive for background playback.
 * Requires `UIBackgroundModes` includes `audio` (see app.config.ts / app.json).
 * Lock screen titles/artwork require MPNowPlayingInfo; expo-av does not expose that from JS yet.
 */
async function applyQuranAudioSession(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    logAudioModeApplied(true);
  } catch (e) {
    logAudioModeApplied(false, e);
    throw e;
  }
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
  useEffect(() => {
    logRuntimeEnvironmentOnce();
  }, []);

  const soundRef = useRef<Audio.Sound | null>(null);
  const prevAppStateRef = useRef<AppStateStatus | null>(null);
  const prevPlayingLoggedRef = useRef<boolean | null>(null);
  const currentRef = useRef<QuranPlaybackCtx["current"]>(null);
  const reciterRef = useRef(FALLBACK_MOBILE_RECITER_ID);
  const [reciterIdEffective, setReciterIdEffective] = useState(FALLBACK_MOBILE_RECITER_ID);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [current, setCurrent] = useState<QuranPlaybackCtx["current"]>(null);
  const [miniStripDismissed, setMiniStripDismissed] = useState(false);
  const [lastHint, setLastHint] = useState<LastRecitationPersisted | null>(null);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

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

  const clearPlaybackError = useCallback(() => {
    setPlaybackError(null);
  }, []);

  useEffect(() => {
    void applyQuranAudioSession();
  }, []);

  useEffect(() => {
    prevAppStateRef.current = AppState.currentState;
    const onChange = (s: AppStateStatus) => {
      logAppStateTransition(prevAppStateRef.current, s);
      prevAppStateRef.current = s;
      if (s === "active") void applyQuranAudioSession();
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, []);

  const unload = useCallback(async (reason: string) => {
    logUnload(reason);
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
      await unload("attachSound_replace");
      await applyQuranAudioSession();
      const initialPos = resumeMs && resumeMs > 500 ? resumeMs : 0;
      prevPlayingLoggedRef.current = null;
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, positionMillis: initialPos },
        (st: AVPlaybackStatus) => {
          if (!st.isLoaded) {
            if ("error" in st && typeof st.error === "string" && st.error.length > 0) {
              setPlaying(false);
              setPlaybackError(FRIENDLY_PLAYBACK_UNAVAILABLE);
              logPlaybackStatusTransition({ phase: "load_error", error: st.error });
              const stale = soundRef.current;
              soundRef.current = null;
              void (async () => {
                try {
                  if (stale) await stale.unloadAsync();
                } catch {
                  /* ignore */
                }
              })();
            }
            return;
          }
          const playingNow = Boolean(st.isPlaying);
          setPlaying(playingNow);
          if (prevPlayingLoggedRef.current !== playingNow) {
            prevPlayingLoggedRef.current = playingNow;
            logPlaybackStatusTransition({
              phase: "transition",
              isPlaying: playingNow,
              positionMillis: st.positionMillis ?? null,
              durationMillis:
                typeof st.durationMillis === "number" ? st.durationMillis : null,
              shouldPlay: st.shouldPlay ?? null,
            });
          }
        },
      );
      soundRef.current = sound;
      try {
        await sound.setProgressUpdateIntervalAsync(750);
      } catch {
        /* ignore — progress interval is optimization only */
      }
    },
    [unload],
  );

  const playVerse = useCallback(
    async (args: PlayArgs) => {
      setMiniStripDismissed(false);
      clearPlaybackError();
      const reciter = (args.reciterId?.trim() ||
        reciterRef.current ||
        FALLBACK_MOBILE_RECITER_ID) as string;
      reciterRef.current = reciter;
      setReciterIdEffective(reciter);
      setBusy(true);
      try {
        const reciterLabel =
          (await resolveReciterDisplayName(reciter)) ?? `Reciter ${reciter}`;

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
        try {
          if (row?.status === "ready" && row.localUri) {
            await attachSound(row.localUri, resumeMs);
          } else {
            const meta = await fetchVerseAudio(args.surahId, args.ayah, reciter);
            await attachSound(meta.audioUrl, resumeMs);
          }
        } catch {
          setPlaybackError(FRIENDLY_PLAYBACK_UNAVAILABLE);
          setPlaying(false);
          setCurrent(null);
          await unload("playVerse_failed");
          return;
        }

        setCurrent({
          surahId: args.surahId,
          ayah: args.ayah,
          verseCount: args.verseCount,
          chapterTitle: args.chapterTitle,
          reciterLabel,
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
    [attachSound, clearPlaybackError, reloadLastRecitation, unload],
  );

  const pause = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    const st = await s.getStatusAsync();
    if (st.isLoaded && st.isPlaying) await s.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    setMiniStripDismissed(false);
    clearPlaybackError();
    const s = soundRef.current;
    if (!s) {
      const c = currentRef.current;
      if (c)
        await playVerse({
          surahId: c.surahId,
          ayah: c.ayah,
          verseCount: c.verseCount,
          chapterTitle: c.chapterTitle,
          reciterId: reciterIdEffective,
        });
      return;
    }
    try {
      await applyQuranAudioSession();
      await s.playAsync();
    } catch {
      setPlaybackError(FRIENDLY_PLAYBACK_UNAVAILABLE);
    }
  }, [clearPlaybackError, playVerse, reciterIdEffective]);

  const stop = useCallback(async () => {
    setPlaying(false);
    setCurrent(null);
    setMiniStripDismissed(false);
    clearPlaybackError();
    await unload("user_stop");
    void clearLastRecitation();
    void reloadLastRecitation();
  }, [unload, reloadLastRecitation, clearPlaybackError]);

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
      playbackError,
      clearPlaybackError,
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
      playbackError,
      clearPlaybackError,
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
    playbackError,
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
            {current.reciterLabel ? (
              <Text style={stripStyles.miniReciter} numberOfLines={1}>
                {current.reciterLabel}
              </Text>
            ) : null}
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
        {playbackError ? (
          <Text style={stripStyles.miniErr} accessibilityRole="alert">
            {playbackError}
          </Text>
        ) : (
          <Text style={stripStyles.miniS}>
            Recitation keeps playing while you browse other apps or lock your device — pause or stop from here anytime.
          </Text>
        )}

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
  miniReciter: {
    marginTop: 2,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: muted,
  },
  miniS: { fontSize: fontSizes.xs, color: muted, lineHeight: 17 },
  miniErr: { fontSize: fontSizes.xs, color: ink, lineHeight: 17, fontWeight: "700" },
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
