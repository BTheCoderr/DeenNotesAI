import type { NoteTypeEnum } from "@/lib/database.types";

import type { NewDeenNoteModeId } from "@/lib/new-deen-note-menu";

const VALID_TYPES: NoteTypeEnum[] = [
  "khutbah",
  "lecture",
  "quran_reflection",
  "halaqa",
  "personal_reminder",
];

export function parseNoteTypeQuery(
  value: string | undefined,
): NoteTypeEnum | undefined {
  if (!value) return undefined;
  return VALID_TYPES.includes(value as NoteTypeEnum)
    ? (value as NoteTypeEnum)
    : undefined;
}

/** Premium flows without full backend wiring yet */
export type NewNotePremiumStub =
  | "record_khutbah"
  | "youtube_lecture"
  | "upload_audio"
  | "scan_pdf";

const PREMIUM_STUBS = new Set<NewNotePremiumStub>([
  "record_khutbah",
  "youtube_lecture",
  "upload_audio",
  "scan_pdf",
]);

const MODE_TO_NOTE: Partial<Record<NewDeenNoteModeId, NoteTypeEnum>> = {
  paste_notes: "personal_reminder",
  personal_reminder: "personal_reminder",
  quran_reflection: "quran_reflection",
};

export type ParsedNewNoteQuery =
  | { kind: "form"; noteType: NoteTypeEnum }
  | { kind: "premium"; stub: NewNotePremiumStub };

function normalizeModeParam(raw: string | undefined): NewDeenNoteModeId | undefined {
  if (!raw) return undefined;
  const m = raw.trim() as NewDeenNoteModeId;
  const valid: NewDeenNoteModeId[] = [
    "record_khutbah",
    "paste_notes",
    "youtube_lecture",
    "upload_audio",
    "quran_reflection",
    "scan_pdf",
    "personal_reminder",
  ];
  return valid.includes(m) ? m : undefined;
}

/**
 * Resolves `?mode=` (preferred) or legacy `?type=` into a form note type or premium stub.
 */
export function parseNewNoteQuery(params: {
  mode?: string;
  type?: string;
}): ParsedNewNoteQuery | undefined {
  const modeFirst = normalizeModeParam(params.mode);
  if (modeFirst) {
    if (PREMIUM_STUBS.has(modeFirst as NewNotePremiumStub)) {
      return { kind: "premium", stub: modeFirst as NewNotePremiumStub };
    }
    const nt = MODE_TO_NOTE[modeFirst];
    if (nt) return { kind: "form", noteType: nt };
    return undefined;
  }

  const legacy = parseNoteTypeQuery(params.type);
  if (legacy) return { kind: "form", noteType: legacy };
  return undefined;
}
