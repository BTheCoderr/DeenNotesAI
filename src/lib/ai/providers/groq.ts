import Groq from "groq-sdk";

import type { AiProvider } from "./types";

export function createGroqProvider(): AiProvider {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  const model = process.env.GROQ_MODEL?.trim();
  if (!model) {
    throw new Error("GROQ_MODEL is not set");
  }
  const client = new Groq({ apiKey });

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
        throw new Error("Groq returned empty content");
      }
      return content;
    },
  };
}
