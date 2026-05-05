import type { NoteTypeEnum } from "@/lib/database.types";

export const NEW_NOTE_EXAMPLES: readonly {
  id: string;
  label: string;
  noteType: NoteTypeEnum;
  rawInput: string;
}[] = [
  {
    id: "khutbah-patience",
    label: "Jumu’ah khutbah about patience",
    noteType: "khutbah",
    rawInput: `Rough notes from today's khutbah:
- Khateeb tied patience to tawakkul — not giving up effort
- Story about delay in something the person wanted; they stayed steady
- "After hardship comes ease" — need to sit with that this week
- Small action: pause before reacting when stressed at work`,
  },
  {
    id: "lecture-gratitude",
    label: "Islamic lecture about gratitude",
    noteType: "lecture",
    rawInput: `Lecture on shukr — my messy notes:
- Gratitude isn't only when life is easy
- Scholar mentioned counting small ni'mahs before big ones
- Practical: start and end day with 3 specific thanks (not generic)
- Tied to family — be present with parents without phones`,
  },
  {
    id: "quran-consistency",
    label: "Quran reflection on consistency",
    noteType: "quran_reflection",
    rawInput: `Personal reflection — not a tafsir session:
- I keep dropping Quran time when work gets busy
- Want something sustainable, not heroic goals
- Theme in my head: small consistent steps beat occasional big bursts
- Question for myself: what 10 min habit can I protect?`,
  },
  {
    id: "halaqa-character",
    label: "Halaqa notes on character",
    noteType: "halaqa",
    rawInput: `Weekly halaqa — adab and lowering the voice
- Discussion on gentle speech with family
- Someone shared avoiding sarcasm that hurts
- Homework: one conversation this week with full attention, no interrupting
- Reminder: husn al-dhann when annoyed`,
  },
];
