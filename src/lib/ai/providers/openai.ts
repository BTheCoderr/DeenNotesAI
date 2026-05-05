import OpenAI from "openai";

import type { AiProvider } from "./types";

export function createOpenAiProvider(): AiProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const model = process.env.OPENAI_MODEL?.trim();
  if (!model) {
    throw new Error("OPENAI_MODEL is not set");
  }
  const client = new OpenAI({ apiKey });

  return {
    async complete({ system, user }) {
      const res = await client.chat.completions.create({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      const content = res.choices[0]?.message?.content;
      if (!content) {
        throw new Error("OpenAI returned empty content");
      }
      return content;
    },
  };
}
