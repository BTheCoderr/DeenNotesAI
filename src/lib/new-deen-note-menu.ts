export type NewDeenNoteModeId =
  | "record_khutbah"
  | "paste_notes"
  | "youtube_lecture"
  | "upload_audio"
  | "quran_reflection"
  | "scan_pdf"
  | "personal_reminder";

export type NewDeenNoteMenuRow = {
  mode: NewDeenNoteModeId;
  title: string;
  description: string;
  /** Premium / backend not ready yet */
  comingSoon?: boolean;
};

export const NEW_DEEN_NOTE_MENU_ROWS: NewDeenNoteMenuRow[] = [
  {
    mode: "record_khutbah",
    title: "Record Khutbah",
    description:
      "Capture Jumu’ah khutbah or short reminders — DeenNotes will help structure what you heard.",
    comingSoon: true,
  },
  {
    mode: "paste_notes",
    title: "Paste Notes",
    description:
      "Drop rough lines from khutbah, halaqa, or class — shape them into reflections and duas.",
  },
  {
    mode: "youtube_lecture",
    title: "YouTube Lecture Link",
    description:
      "Islamic lectures, khutbah replays, or halaqa recordings — distill points you want to apply.",
    comingSoon: true,
  },
  {
    mode: "upload_audio",
    title: "Upload Audio",
    description:
      "Khutbah, halaqa, or reminders you already recorded — summaries stay private-first.",
    comingSoon: true,
  },
  {
    mode: "quran_reflection",
    title: "Qur’an Reflection",
    description:
      "Ayat you’re pondering — pair Arabic with translation/tafsir notes and respectful reflection prompts.",
  },
  {
    mode: "scan_pdf",
    title: "Scan / Upload PDF",
    description:
      "Halaqa handouts or Ramadan prep sheets — excerpt what you’ll review after class.",
    comingSoon: true,
  },
  {
    mode: "personal_reminder",
    title: "Personal reminder",
    description:
      "Small niyat, adab, dua themes, or weekly checks — revisit without guilt.",
  },
];
