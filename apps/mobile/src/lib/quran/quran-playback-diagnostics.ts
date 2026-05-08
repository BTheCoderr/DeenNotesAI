import Constants from "expo-constants";

const TAG = "[QuranPlayback]";

function shouldLog(): boolean {
  return __DEV__;
}

/** One-time hint: Expo Go cannot exercise real background audio entitlements. */
export function logRuntimeEnvironmentOnce(): void {
  if (!shouldLog()) return;
  try {
    const env = Constants.executionEnvironment;
    const isExpoGo = env === "storeClient";
    console.log(`${TAG} executionEnvironment=${String(env)}${isExpoGo ? " (Expo Go — use iOS development build for background audio QA)" : ""}`);
  } catch {
    console.log(`${TAG} executionEnvironment=(unknown)`);
  }
}

export function logAppStateTransition(from: string | null, to: string): void {
  if (!shouldLog()) return;
  console.log(`${TAG} AppState ${from ?? "?"} → ${to}`);
}

export function logAudioModeApplied(ok: boolean, err?: unknown): void {
  if (!shouldLog()) return;
  if (ok) console.log(`${TAG} setAudioModeAsync OK (playsInSilentModeIOS, staysActiveInBackground, duckOthers)`);
  else console.warn(`${TAG} setAudioModeAsync failed`, err);
}

export function logUnload(reason: string): void {
  if (!shouldLog()) return;
  console.log(`${TAG} unload ${reason}`);
}

export function logPlaybackStatusTransition(detail: Record<string, unknown>): void {
  if (!shouldLog()) return;
  console.log(`${TAG} status`, detail);
}
