import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseBrowserConfig } from "./env";

/** Use in Route Handlers when cookies must be written (e.g. OAuth code exchange). */
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
