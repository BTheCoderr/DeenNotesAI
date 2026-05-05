import Anthropic from "@anthropic-ai/sdk";

import type { AiProvider } from "./types";

export function createAnthropicProvider(): AiProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-sonnet-20241022";
  const client = new Anthropic({ apiKey });

  return {
    async complete({ system, user }) {
      const res = await client.messages.create({
        model,
        max_tokens: 4096,
        temperature: 0.4,
        system,
        messages: [{ role: "user", content: user }],
      });
      const block = res.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") {
        throw new Error("Anthropic returned no text block");
      }
      return block.text;
    },
  };
}
