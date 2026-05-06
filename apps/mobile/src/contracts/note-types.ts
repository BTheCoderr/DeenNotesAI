/** Matches web NOTE_TYPE_LABELS for list cards — keep in sync visually. */
export const NOTE_TYPE_LABELS: Record<
  string,
  string
> = {
  khutbah: "Khutbah",
  lecture: "Islamic lecture",
  quran_reflection: "Quran reflection",
  halaqa: "Halaqa",
  personal_reminder: "Reminder & dua",
};

export function labelForNoteType(type: string): string {
  return NOTE_TYPE_LABELS[type] ?? type;
}
