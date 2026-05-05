/**
 * Supabase client URL + anonymous/publishable key for browser and server user sessions.
 * At least one of ANON_KEY or PUBLISHABLE_KEY must be set (many dashboards only show publishable).
 */
export function getSupabaseBrowserConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration: set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
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
