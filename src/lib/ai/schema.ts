import { z } from "zod";

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
  })
  .strict();

export type AiNotePayload = z.infer<typeof aiNoteSchema>;
