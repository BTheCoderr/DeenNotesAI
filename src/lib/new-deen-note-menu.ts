import type { NoteTypeEnum } from "@/lib/database.types";

export type NewDeenNoteMenuItem = {
  type: NoteTypeEnum;
  title: string;
  description: string;
};

export const NEW_DEEN_NOTE_MENU_ITEMS: NewDeenNoteMenuItem[] = [
  {
    type: "personal_reminder",
    title: "Paste Notes",
    description: "Turn messy notes into a structured reflection.",
  },
  {
    type: "khutbah",
    title: "Khutbah Notes",
    description: "Capture Jumu’ah reminders and weekly action steps.",
  },
  {
    type: "lecture",
    title: "Islamic Lecture",
    description: "Summarize a lecture into key reminders.",
  },
  {
    type: "quran_reflection",
    title: "Qur’an Reflection",
    description: "Organize ayah reflections and personal takeaways.",
  },
  {
    type: "halaqa",
    title: "Halaqa Guide",
    description: "Create discussion questions for a group.",
  },
];
