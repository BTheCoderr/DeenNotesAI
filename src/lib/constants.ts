export const APP_DISCLAIMER =
  "DeenNotes is for organizing Islamic learning and personal reflection. It does not provide fatwas or religious rulings. Please consult a qualified scholar or imam for religious decisions.";

export const NOTE_TYPE_LABELS: Record<
  | "khutbah"
  | "lecture"
  | "quran_reflection"
  | "halaqa"
  | "personal_reminder",
  string
> = {
  khutbah: "Khutbah",
  lecture: "Lecture",
  quran_reflection: "Quran Reflection",
  halaqa: "Halaqa",
  personal_reminder: "Personal Reminder",
};

export function labelForNoteType(type: string): string {
  if (type in NOTE_TYPE_LABELS) {
    return NOTE_TYPE_LABELS[type as keyof typeof NOTE_TYPE_LABELS];
  }
  return type;
}

/** Optional: set NEXT_PUBLIC_BETA_FEEDBACK_EMAIL in .env for a direct recipient. */
export function betaFeedbackMailto(): string {
  const to = process.env.NEXT_PUBLIC_BETA_FEEDBACK_EMAIL?.trim() ?? "";
  const subject = encodeURIComponent("DeenNotes beta feedback");
  const body = encodeURIComponent(
    "Hi DeenNotes team,\n\nHere is my feedback:\n\n",
  );
  const q = `subject=${subject}&body=${body}`;
  if (to) {
    return `mailto:${encodeURIComponent(to)}?${q}`;
  }
  return `mailto:?${q}`;
}
