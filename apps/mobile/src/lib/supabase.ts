import { createClient } from "@supabase/supabase-js";

function readEnv(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[key]?.trim();
}

const url = readEnv("EXPO_PUBLIC_SUPABASE_URL");
const anon = readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");

/**
 * Supabase browser-style client for mobile. Auth session is stored by the SDK;
 * wire AsyncStorage persistence in Phase M2 if you need refresh across cold starts.
 */
export const supabase =
  url && anon
    ? createClient(url, anon)
    : null;
