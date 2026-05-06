import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

function readEnv(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[key]?.trim();
}

const url = readEnv("EXPO_PUBLIC_SUPABASE_URL");
const anon = readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");

/**
 * Supabase client with persisted session for React Native — same anon key + URL as Next.js web app.
 */
export const supabase =
  url && anon
    ? createClient(url, anon, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
