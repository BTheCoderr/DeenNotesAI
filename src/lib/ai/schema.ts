import { z } from "zod";

/** Qur’an citations returned alongside structured note JSON — omit entirely when none appear */
export const quranRefAiSchema = z.object({
  chapter: z.number().int().min(1).max(114),
  verse: z.number().int().min(1).max(286),
});

export const aiNoteSchema = z
  .object({
    title: z.string().min(1),
    short_summary: z.string(),
    main_reminder: z.string(),
    key_reminders: z.array(z.string()),
    action_steps: z.array(z.string()),
    reflection_questions: z.array(z.string()),
    dua_prompts: z.array(z.string()),
    share_card_text: z.string(),
    safety_note: z.string(),
    quran_refs: z.array(quranRefAiSchema).max(48).optional(),
  })
  .strict();

export type AiNotePayload = z.infer<typeof aiNoteSchema>;
