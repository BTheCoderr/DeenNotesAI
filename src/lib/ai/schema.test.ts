import { describe, expect, it } from "vitest";

import { parseModelJson } from "./parse-json";
import { aiNoteSchema } from "./schema";

const validPayload = {
  title: "Patience after a long week",
  short_summary:
    "Notes tied patience to tawakkul and small pauses before reacting under stress.",
  main_reminder: "Choose one calm pause before answering when tight this week.",
  key_reminders: ["Patience is active, not passive."],
  action_steps: ["Journal one moment of sabr."],
  reflection_questions: ["Where did I rush my response?"],
  dua_prompts: ["Ask Allah for steadfastness in your own words."],
  share_card_text:
    "Before you answer, breathe once—small pauses guard the heart.",
  safety_note:
    "DeenNotes is not for fatwas; ask a qualified scholar for rulings.",
};

describe("aiNoteSchema", () => {
  it("accepts a complete strict payload", () => {
    const parsed = aiNoteSchema.parse(validPayload);
    expect(parsed.title).toBe(validPayload.title);
    expect(parsed.short_summary).toContain("tawakkul");
  });

  it("rejects unknown keys", () => {
    expect(() =>
      aiNoteSchema.parse({ ...validPayload, summary: "legacy" }),
    ).toThrow();
  });

  it("accepts optional quran_refs", () => {
    const parsed = aiNoteSchema.parse({
      ...validPayload,
      quran_refs: [{ chapter: 2, verse: 255 }],
    });
    expect(parsed.quran_refs?.[0]).toEqual({ chapter: 2, verse: 255 });
  });
});

describe("parseModelJson", () => {
  it("strips markdown json fences", () => {
    const raw = "```json\n{\"a\":1}\n```";
    expect(parseModelJson(raw)).toEqual({ a: 1 });
  });
});
