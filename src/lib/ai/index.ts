import { z } from "zod";

import { parseModelJson } from "./parse-json";
import { aiNoteSchema, type AiNotePayload } from "./schema";
import { AI_SYSTEM_PROMPT, buildUserPrompt } from "./system-prompt";
import { createAnthropicProvider } from "./providers/anthropic";
import { createGroqProvider } from "./providers/groq";
import { createOpenAiProvider } from "./providers/openai";
import type { AiProvider, AiProviderName } from "./providers/types";

export type { AiNotePayload };

function resolveProvider(name: string): AiProvider {
  const normalized = name.toLowerCase() as AiProviderName;
  switch (normalized) {
    case "anthropic":
      return createAnthropicProvider();
    case "groq":
      return createGroqProvider();
    case "openai":
      return createOpenAiProvider();
    default:
      throw new Error(
        `Unknown AI_PROVIDER "${name}". Use openai, anthropic, or groq.`,
      );
  }
}

export function getAiProvider(): AiProvider {
  const name = process.env.AI_PROVIDER ?? "openai";
  return resolveProvider(name);
}

export async function generateNoteFromRaw(input: {
  noteTypeLabel: string;
  rawInput: string;
}): Promise<AiNotePayload> {
  const provider = getAiProvider();
  const raw = await provider.complete({
    system: AI_SYSTEM_PROMPT,
    user: buildUserPrompt(input.noteTypeLabel, input.rawInput),
  });
  const parsed = parseModelJson(raw);
  try {
    return aiNoteSchema.parse(parsed);
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error("DeenNotes AI output failed validation", e.flatten());
    }
    throw e;
  }
}
