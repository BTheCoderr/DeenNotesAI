import { SavedNotesExplorer } from "@/components/notes/SavedNotesExplorer";
import { createClient } from "@/lib/supabase/server";

export default async function NotesListPage() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("deen_notes")
    .select(
      "id, title, note_type, created_at, summary, short_summary, main_reminder",
    )
    .order("created_at", { ascending: false });

  return (
    <SavedNotesExplorer notes={notes ?? []} loadError={Boolean(error)} />
  );
}
