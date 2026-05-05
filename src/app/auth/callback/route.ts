import { NextResponse } from "next/server";

import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { safeAppPath } from "@/lib/safe-app-path";

/**
 * OAuth / PKCE / email-confirmation redirects land here with `?code=`.
 * Email+password sign-in does not use this route; it sets the session in the browser directly.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAppPath(searchParams.get("next"));

  if (code) {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
