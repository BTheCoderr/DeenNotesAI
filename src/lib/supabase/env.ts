function logSupabasePublicEnvPresence(): void {
  const debug =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_ENV === "true";
  if (!debug) return;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rawPublishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  console.log("[deennotes supabase env]", {
    hasUrl: Boolean(rawUrl?.trim()),
    hasAnonKey: Boolean(rawAnon?.trim()),
    hasPublishableKey: Boolean(rawPublishable?.trim()),
  });
}

/**
 * Supabase client URL + anonymous/publishable key for browser and server user sessions.
 * At least one of PUBLISHABLE_KEY or ANON_KEY must be set. PUBLISHABLE_KEY is preferred when both exist.
 *
 * Optional: set NEXT_PUBLIC_DEBUG_ENV=true (and redeploy on Netlify) to log booleans only—never secret values.
 */
export function getSupabaseBrowserConfig(): { url: string; anonKey: string } {
  logSupabasePublicEnvPresence();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anonFallback = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const anonKey = publishable || anonFallback || "";

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY. On Netlify, NEXT_PUBLIC_* vars are inlined at build time—redeploy after changing them.",
    );
  }

  return { url, anonKey };
}

/**
 * Server-only optional secret for admin scripts or future server routes.
 * Never expose as NEXT_PUBLIC_* or import from Client Components.
 */
export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}
