const KEY = "deennotes:continue_note_id";

export function rememberContinueNoteId(noteId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, noteId);
  } catch {
    /* private mode / quota */
  }
}

export function readContinueNoteId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
