import type { NoteTypeEnum } from "@/lib/database.types";

export const NEW_NOTE_USE_CASES: readonly {
  id: string;
  buttonLabel: string;
  noteType: NoteTypeEnum;
  rawInput: string;
}[] = [
  {
    id: "use-khutbah",
    buttonLabel: "📖 From today's khutbah",
    noteType: "khutbah",
    rawInput: `Rough notes from today's khutbah:
- Khateeb tied patience to tawakkul — not giving up effort
- Story about delay in something the person wanted; they stayed steady
- "After hardship comes ease" — need to sit with that this week
- Small action: pause before reacting when stressed at work`,
  },
  {
    id: "use-lecture",
    buttonLabel: "🎧 From a lecture",
    noteType: "lecture",
    rawInput: `Lecture on shukr — my messy notes:
- Gratitude isn't only when life is easy
- Scholar mentioned counting small ni'mahs before big ones
- Practical: start and end day with 3 specific thanks (not generic)
- Tied to family — be present with parents without phones`,
  },
  {
    id: "use-quran",
    buttonLabel: "📿 From Qur'an reflection",
    noteType: "quran_reflection",
    rawInput: `Personal reflection — not a tafsir session:
- Ayah on my mind: consistency and not despairing of Allah's mercy
- I keep dropping Quran time when work gets busy
- Want something sustainable, not heroic goals
- Question for myself: what 10 min habit can I protect?`,
  },
  {
    id: "use-clarity",
    buttonLabel: "🧠 Something on your mind",
    noteType: "personal_reminder",
    rawInput: `Brain dump — help me find clarity:
- Mind feels pulled between work, family, and deen
- I want salah to feel less rushed this week
- Tone at home: gentler, less sharp when I'm tired
- One conversation I've been avoiding — want to approach it with adab`,
  },
] as const;
