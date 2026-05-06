import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createSupabaseApiRouteContext,
} from "@/lib/supabase/api-route";

const SESSION_ERROR = "Your session expired. Please sign in again.";

const bodySchema = z.object({
  noteId: z.string().uuid(),
  shareCardText: z.string().min(1),
});

function logApiAuthDebug(
  route: string,
  request: NextRequest,
  hasUser: boolean,
  hasAuthCookies: boolean,
) {
  if (process.env.NODE_ENV !== "development") return;
  console.log("[deennotes api auth]", {
    route,
    pathname: request.nextUrl.pathname,
    hasUser,
    hasAuthCookies,
  });
}

export async function POST(request: NextRequest) {
  const { supabase, hasAuthCookies } = await createSupabaseApiRouteContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  logApiAuthDebug("POST /api/saved-share-cards", request, Boolean(user), hasAuthCookies);

  if (!user) {
    return NextResponse.json({ error: SESSION_ERROR }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { noteId, shareCardText } = parsed.data;

  const { data, error } = await supabase
    .from("saved_share_cards")
    .insert({
      user_id: user.id,
      deen_note_id: noteId,
      share_card_text: shareCardText,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json({ error: "Could not save card." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
