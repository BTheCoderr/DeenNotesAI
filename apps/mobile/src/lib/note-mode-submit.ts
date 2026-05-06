import { NOTE_MODE_CONTRACTS } from "../contracts/note-modes";
import type { NoteModeId } from "../contracts/note-modes";

import type { GenerateNoteBody } from "../api/generateNote";

/** Maps Expo compose mode → API noteType (shared contract). */
export function generateNotePayloadForMode(
  modeId: NoteModeId,
  rawInput: string,
): GenerateNoteBody | null {
  const mode = NOTE_MODE_CONTRACTS.find((m) => m.id === modeId);
  if (!mode?.noteType) return null;
  return { noteType: mode.noteType, rawInput };
}
