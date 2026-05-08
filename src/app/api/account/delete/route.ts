import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { corsHeadersForMobileApi, getSupabaseAndUserForApi } from "@/lib/supabase/mobile-bearer-client";
import { getSupabaseBrowserConfig, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

const SESSION_ERROR = "Your session expired. Please sign in again.";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeadersForMobileApi(request),
  });
}

/**
 * Authenticated account deletion (mobile bearer or web cookies).
 * Requires `SUPABASE_SERVICE_ROLE_KEY` on the server — set in Netlify / Vercel env.
 * Removes application rows for the user, then deletes the auth user record.
 */
export async function DELETE(request: NextRequest) {
  const cors = corsHeadersForMobileApi(request);

  let user;
  try {
    const ctx = await getSupabaseAndUserForApi(request);
    user = ctx.user;
  } catch {
    return NextResponse.json({ error: SESSION_ERROR }, { status: 401, headers: cors });
  }

  const serviceRole = getSupabaseServiceRoleKey();
  if (!serviceRole) {
    return NextResponse.json(
      {
        error:
          "Account deletion is not available right now. Please try again later or contact support through the Contact page.",
      },
      { status: 503, headers: cors },
    );
  }

  const { url } = getSupabaseBrowserConfig();
  const admin = createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const uid = user.id;

  try {
    const { error: e1 } = await admin.from("saved_share_cards").delete().eq("user_id", uid);
    if (e1) throw e1;

    const { error: e2 } = await admin.from("deen_notes").delete().eq("user_id", uid);
    if (e2) throw e2;

    const { error: e3 } = await admin.from("user_onboarding_profiles").delete().eq("user_id", uid);
    if (e3) throw e3;

    const { error: e4 } = await admin.from("profiles").delete().eq("id", uid);
    if (e4) throw e4;

    const { error: authErr } = await admin.auth.admin.deleteUser(uid);
    if (authErr) throw authErr;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deletion failed.";
    if (process.env.NODE_ENV === "development") {
      console.error("[api/account/delete]", err);
    }
    return NextResponse.json(
      { error: "We could not finish deleting your account. Please try again or contact support." },
      { status: 500, headers: cors },
    );
  }

  return new NextResponse(null, { status: 204, headers: cors });
}
