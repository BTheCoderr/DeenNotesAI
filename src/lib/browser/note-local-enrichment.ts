/**
 * Notebook “living margins” persisted per note on-device (Expo: swap for SQLite / FS).
 */
export type NoteAttachmentLocal = {
  kind: "image" | "scan" | "pdf_snippet" | "voice_hint" | "tafsir";
  label: string;
  /** Inline image previews only — keep payloads small for localStorage. */
  dataUrl?: string;
  hint?: string;
  at?: string;
};

export type NoteLocalEnrichment = {
  pinnedTakeaway?: string;
  /** Freeform continuation prompts / journal bleed */
  continueReflecting?: string;
  highlightPhrases?: string[];
  attachments?: NoteAttachmentLocal[];
};

const PREFIX = "deennotes.note.enrich.v1";

function key(noteId: string) {
  return `${PREFIX}.${noteId}`;
}

export function readNoteEnrichment(noteId: string): NoteLocalEnrichment {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key(noteId));
    if (!raw) return {};
    const j = JSON.parse(raw) as NoteLocalEnrichment;
    return j && typeof j === "object" ? j : {};
  } catch {
    return {};
  }
}

export function writeNoteEnrichment(noteId: string, patch: NoteLocalEnrichment) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(noteId), JSON.stringify(patch));
  } catch {
    /* quota — drop attachments silently if needed */
  }
}

export function mergeNoteEnrichment(
  noteId: string,
  partial: Partial<NoteLocalEnrichment>,
) {
  const cur = readNoteEnrichment(noteId);
  writeNoteEnrichment(noteId, { ...cur, ...partial });
}

const MAX_ATTACHMENT_BYTES_HINT = 600_000;

export function attachmentsWithinBudget(list: NoteAttachmentLocal[]) {
  const next: NoteAttachmentLocal[] = [];
  let sum = 0;
  for (const a of list) {
    if (a.kind === "image" && a.dataUrl) {
      const approx = new Blob([a.dataUrl]).size;
      if (sum + approx > MAX_ATTACHMENT_BYTES_HINT) continue;
      sum += approx;
    }
    next.push(a);
    if (next.length >= 8) break;
  }
  return next;
}
