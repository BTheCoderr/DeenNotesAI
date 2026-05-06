import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateNoteFromRaw } from "@/lib/ai";
import { APP_DISCLAIMER, NOTE_TYPE_LABELS } from "@/lib/constants";
import type { NoteTypeEnum } from "@/lib/database.types";
import { corsHeadersForMobileApi, getSupabaseAndUserForApi } from "@/lib/supabase/mobile-bearer-client";

const SESSION_ERROR = "Your session expired. Please sign in again.";

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

function logApiAuthDebug(
  route: string,
  request: NextRequest,
  hasUser: boolean,
  hasAuthCookies: boolean,
  bearer: boolean,
) {
  if (process.env.NODE_ENV !== "development") return;
  console.log("[deennotes api auth]", {
    route,
    pathname: request.nextUrl.pathname,
    hasUser,
    hasAuthCookies,
    bearer,
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeadersForMobileApi(request),
  });
}

export async function POST(request: NextRequest) {
  const cors = corsHeadersForMobileApi(request);
  const bearer =
    Boolean(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()) ||
    false;

  let supabase;
  let user;
  let hasAuthCookies = false;

  try {
    const ctx = await getSupabaseAndUserForApi(request);
    supabase = ctx.supabase;
    user = ctx.user;
    hasAuthCookies = ctx.hasAuthCookies;
  } catch {
    return NextResponse.json(
      { error: SESSION_ERROR },
      { status: 401, headers: cors },
    );
  }

  logApiAuthDebug("POST /api/generate-note", request, Boolean(user), hasAuthCookies, bearer);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: cors });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.noteType?.[0] ??
      parsed.error.flatten().fieldErrors.rawInput?.[0] ??
      "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400, headers: cors });
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
      { status: 502, headers: cors },
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
      quran_refs:
        ai.quran_refs && ai.quran_refs.length ? ai.quran_refs : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return NextResponse.json(
      { error: "Your note was generated but could not be saved." },
      { status: 500, headers: cors },
    );
  }

  return NextResponse.json({ noteId: data.id }, { headers: cors });
}
