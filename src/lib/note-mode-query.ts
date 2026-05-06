import type { NoteTypeEnum } from "@/lib/database.types";
import {
  NOTE_MODE_CONTRACTS,
  NOTE_MODE_IDS,
  type NoteModeId,
} from "@/shared/note-modes";

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
  | "upload_pdf";

const PREMIUM_STUBS = new Set<NewNotePremiumStub>(
  NOTE_MODE_CONTRACTS.filter((m) => m.comingSoon).map((m) => m.id as NewNotePremiumStub),
);

const MODE_TO_NOTE: Partial<Record<NoteModeId, NoteTypeEnum>> = Object.fromEntries(
  NOTE_MODE_CONTRACTS.flatMap((m) =>
    m.noteType ? [[m.id, m.noteType as NoteTypeEnum] as const] : [],
  ),
) as Partial<Record<NoteModeId, NoteTypeEnum>>;

export type ParsedNewNoteQuery =
  | { kind: "form"; noteType: NoteTypeEnum }
  | { kind: "premium"; stub: NewNotePremiumStub };

function normalizeModeParam(raw: string | undefined): NoteModeId | undefined {
  if (!raw) return undefined;
  const legacyMapped = raw.trim() === "scan_pdf" ? "upload_pdf" : raw.trim();
  const m = legacyMapped as NoteModeId;
  return NOTE_MODE_IDS.includes(m) ? m : undefined;
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
