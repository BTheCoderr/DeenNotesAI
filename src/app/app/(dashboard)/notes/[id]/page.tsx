import { notFound } from "next/navigation";

import {
  NoteDetailScreen,
  type NoteDetailPayload,
} from "@/components/notes/note-detail";
import { asStringArray } from "@/lib/note-json";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from("deen_notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !note) {
    notFound();
  }

  const payload: NoteDetailPayload = {
    id: note.id,
    title: note.title,
    note_type: note.note_type,
    created_at: note.created_at,
    summary: note.summary,
    short_summary: note.short_summary,
    main_reminder:
      typeof note.main_reminder === "string" ? note.main_reminder : "",
    key_reminders: asStringArray(note.key_reminders),
    action_steps: asStringArray(note.action_steps),
    reflection_questions: asStringArray(note.reflection_questions),
    dua_prompts: asStringArray(note.dua_prompts),
    share_card_text: note.share_card_text,
    disclaimer: note.disclaimer,
    raw_input: note.raw_input,
  };

  return <NoteDetailScreen note={payload} />;
}
