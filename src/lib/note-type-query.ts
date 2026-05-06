import type { NoteTypeEnum } from "@/lib/database.types";

const VALID: NoteTypeEnum[] = [
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
  return VALID.includes(value as NoteTypeEnum)
    ? (value as NoteTypeEnum)
    : undefined;
}
