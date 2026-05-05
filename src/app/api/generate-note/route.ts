import { NextResponse } from "next/server";
import { z } from "zod";

import { generateNoteFromRaw } from "@/lib/ai";
import { APP_DISCLAIMER, NOTE_TYPE_LABELS } from "@/lib/constants";
import type { NoteTypeEnum } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const noteTypes = [
  "khutbah",
  "lecture",
  "quran_reflection",
  "halaqa",
  "personal_reminder",
] as const satisfies readonly NoteTypeEnum[];

const bodySchema = z.object({
  noteType: z.enum(noteTypes),
  rawInput: z
    .string()
    .min(1, "Paste your notes so DeenNotes can reflect them back."),
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
    const msg =
      parsed.error.flatten().fieldErrors.noteType?.[0] ??
      parsed.error.flatten().fieldErrors.rawInput?.[0] ??
      "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { noteType, rawInput } = parsed.data;
  const noteTypeLabel = NOTE_TYPE_LABELS[noteType];

  let ai;
  try {
    ai = await generateNoteFromRaw({ noteTypeLabel, rawInput });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "We couldn't generate your note. Try again in a moment." },
      { status: 502 },
    );
  }

  const disclaimer = [APP_DISCLAIMER, ai.safety_note].filter(Boolean).join("\n\n");

  const { data, error } = await supabase
    .from("deen_notes")
    .insert({
      user_id: user.id,
      note_type: noteType,
      title: ai.title,
      raw_input: rawInput,
      summary: ai.short_summary,
      short_summary: ai.short_summary,
      main_reminder: ai.main_reminder,
      key_reminders: ai.key_reminders,
      action_steps: ai.action_steps,
      reflection_questions: ai.reflection_questions,
      dua_prompts: ai.dua_prompts,
      share_card_text: ai.share_card_text,
      disclaimer,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json(
      { error: "Your note was generated but could not be saved." },
      { status: 500 },
    );
  }

  return NextResponse.json({ noteId: data.id });
}
