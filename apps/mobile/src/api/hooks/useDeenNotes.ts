import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../lib/supabase";

export type DeenNoteRow = {
  id: string;
  title: string;
  note_type: string;
  created_at: string;
  raw_input: string;
  summary: string;
  short_summary: string;
  main_reminder: string;
  key_reminders: unknown;
  action_steps: unknown;
  reflection_questions: unknown;
  dua_prompts: unknown;
  share_card_text: string | null;
  disclaimer: string;
  quran_refs: unknown;
};

export const deenNotesListQueryKey = ["deen_notes", "list"] as const;

export function useDeenNotesList(enabled: boolean) {
  return useQuery({
    queryKey: deenNotesListQueryKey,
    enabled: Boolean(supabase) && enabled,
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("deen_notes")
        .select(
          "id, title, note_type, created_at, short_summary, main_reminder",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Pick<
        DeenNoteRow,
        "id" | "title" | "note_type" | "created_at" | "short_summary" | "main_reminder"
      >[];
    },
    staleTime: 30_000,
  });
}

export function useDeenNote(noteId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["deen_notes", noteId],
    enabled: Boolean(supabase) && Boolean(noteId) && enabled,
    queryFn: async () => {
      if (!supabase || !noteId) return null;
      const { data, error } = await supabase
        .from("deen_notes")
        .select("*")
        .eq("id", noteId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as DeenNoteRow | null;
    },
    staleTime: 30_000,
  });
}
