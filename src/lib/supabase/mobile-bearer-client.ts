import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { createSupabaseApiRouteContext } from "@/lib/supabase/api-route";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export function corsHeadersForMobileApi(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const allow = origin?.length ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

/**
 * Web: Supabase session cookies (SSR). Mobile / native: `Authorization: Bearer <access_token>`.
 */
export async function getSupabaseAndUserForApi(
  request: NextRequest,
): Promise<{
  supabase: SupabaseClient;
  user: User;
  hasAuthCookies: boolean;
}> {
  const bearer =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";

  if (bearer.length > 0) {
    const { url, anonKey } = getSupabaseBrowserConfig();
    const supabase = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
      },
    });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearer);
    if (error || !user) {
      throw new Error("UNAUTHORIZED");
    }
    return { supabase, user, hasAuthCookies: false };
  }

  const { supabase, hasAuthCookies } = await createSupabaseApiRouteContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return { supabase, user, hasAuthCookies };
}
