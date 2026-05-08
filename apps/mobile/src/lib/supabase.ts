import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

/**
 * Expo inlines `EXPO_PUBLIC_*` only for **static** `process.env.EXPO_PUBLIC_*` access at bundle time.
 * Dynamic lookups like `process.env[key]` are not rewritten, so Release/TestFlight builds would get
 * no URL/key and `supabase` would stay null — see https://docs.expo.dev/guides/environment-variables/
 */
function trimEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t || undefined;
}

const url = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_URL);
const anon = trimEnv(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

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
