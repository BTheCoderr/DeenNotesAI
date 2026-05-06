import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseBrowserConfig } from "./env";

export type SupabaseApiRouteContext = {
  supabase: ReturnType<typeof createServerClient>;
  /** Any `sb-*` cookie from Supabase SSR (presence only; dev logging). */
  hasAuthCookies: boolean;
};

/**
 * Single `cookies()` read for Route Handlers. Use this instead of
 * `NextRequest.cookies` for auth — required for reliable sessions on Netlify.
 */
export async function createSupabaseApiRouteContext(): Promise<SupabaseApiRouteContext> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const hasAuthCookies = all.some((c) => c.name.startsWith("sb-"));
  const { url, anonKey } = getSupabaseBrowserConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* cookie write not allowed in this context */
        }
      },
    },
  });

  return { supabase, hasAuthCookies };
}
