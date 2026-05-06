export type NoteModeId =
  | "record_khutbah"
  | "paste_notes"
  | "youtube_lecture"
  | "upload_audio"
  | "quran_reflection"
  | "upload_pdf"
  | "personal_reminder";

export type NoteModeContract = {
  id: NoteModeId;
  label: string;
  description: string;
  enabled: boolean;
  iconHint: string;
  routeQuery: { key: "mode"; value: NoteModeId };
  noteType?: "quran_reflection" | "personal_reminder" | "khutbah";
  comingSoon: boolean;
};

export const NOTE_MODE_CONTRACTS: readonly NoteModeContract[] = [
  {
    id: "record_khutbah",
    label: "Record Khutbah",
    description:
      "Capture Jumu'ah khutbah or short reminders - DeenNotes will help structure what you heard.",
    iconHint: "mic",
    enabled: true,
    routeQuery: { key: "mode", value: "record_khutbah" },
    noteType: "khutbah",
    comingSoon: false,
  },
  {
    id: "paste_notes",
    label: "Paste Notes",
    description:
      "Drop rough lines from khutbah, halaqa, or class - shape them into reflections and duas.",
    iconHint: "document-text",
    enabled: true,
    routeQuery: { key: "mode", value: "paste_notes" },
    noteType: "personal_reminder",
    comingSoon: false,
  },
  {
    id: "youtube_lecture",
    label: "YouTube Lecture Link",
    description:
      "Islamic lectures, khutbah replays, or halaqa recordings - distill points you want to apply.",
    iconHint: "play-circle",
    enabled: true,
    routeQuery: { key: "mode", value: "youtube_lecture" },
    comingSoon: true,
  },
  {
    id: "upload_audio",
    label: "Upload Audio",
    description:
      "Khutbah, halaqa, or reminders you already recorded - summaries stay private-first.",
    iconHint: "waveform",
    enabled: true,
    routeQuery: { key: "mode", value: "upload_audio" },
    comingSoon: true,
  },
  {
    id: "quran_reflection",
    label: "Quran Reflection",
    description:
      "Ayat you're pondering - pair Arabic with translation/tafsir notes and respectful reflection prompts.",
    iconHint: "book-open",
    enabled: true,
    routeQuery: { key: "mode", value: "quran_reflection" },
    noteType: "quran_reflection",
    comingSoon: false,
  },
  {
    id: "upload_pdf",
    label: "Scan / Upload PDF",
    description:
      "Halaqa handouts or Ramadan prep sheets - excerpt what you'll review after class.",
    iconHint: "scan",
    enabled: true,
    routeQuery: { key: "mode", value: "upload_pdf" },
    comingSoon: true,
  },
  {
    id: "personal_reminder",
    label: "Personal Reminder",
    description:
      "Small niyat, adab, dua themes, or weekly checks - revisit without guilt.",
    iconHint: "sparkles",
    enabled: true,
    routeQuery: { key: "mode", value: "personal_reminder" },
    noteType: "personal_reminder",
    comingSoon: false,
  },
] as const;
