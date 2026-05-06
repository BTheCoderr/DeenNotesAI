import Constants from "expo-constants";

/**
 * Production: set `EXPO_PUBLIC_NEXT_ORIGIN` (e.g. https://deennotes.example.com) in EAS env.
 * Dev: defaults to Metro host for local Next — override if API runs elsewhere.
 */

function devHost(): string {
  const dbg = Constants.expoConfig?.hostUri;
  if (typeof dbg === "string" && dbg.length) {
    const host = dbg.split(":")[0];
    return `http://${host}:3000`;
  }
  return "http://127.0.0.1:3000";
}

export function getNextOrigin(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.EXPO_PUBLIC_NEXT_ORIGIN?.trim()
      : undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (__DEV__) return devHost();
  throw new Error(
    "Set EXPO_PUBLIC_NEXT_ORIGIN for production builds (your deployed Next.js URL).",
  );
}

export function apiUrl(path: string): string {
  const base = getNextOrigin().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
