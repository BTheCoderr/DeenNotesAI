import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  noteId: z.string().uuid(),
  shareCardText: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
