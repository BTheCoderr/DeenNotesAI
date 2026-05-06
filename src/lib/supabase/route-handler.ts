import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseBrowserConfig } from "./env";

/**
 * Use when cookies must be written via `next/headers` only (e.g. OAuth code exchange).
 * For JSON API routes, use {@link createSupabaseApiRouteContext} in `api-route.ts`.
 */
export async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseBrowserConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}
