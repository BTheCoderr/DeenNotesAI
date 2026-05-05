import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { safeAppPath } from "@/lib/safe-app-path";

import { getSupabaseBrowserConfig } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url: supabaseUrl, anonKey } = getSupabaseBrowserConfig();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isApp = path.startsWith("/app");

  if (process.env.NODE_ENV === "development") {
    console.log("[deennotes middleware]", {
      pathname: path,
      hasSession: Boolean(user),
      redirectedToLogin: Boolean(!user && isApp),
    });
  }

  if (!user && isApp) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/login") || path.startsWith("/signup"))) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = safeAppPath(next);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
