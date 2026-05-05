export type AiProviderName = "openai" | "anthropic" | "groq";

export interface AiProvider {
  /** Returns raw model text (expected JSON object). */
  complete(input: { system: string; user: string }): Promise<string>;
}
