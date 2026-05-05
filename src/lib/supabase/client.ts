import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseBrowserConfig } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  return createBrowserClient(url, anonKey);
}
