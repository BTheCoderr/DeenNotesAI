/** Best-effort: strip ```json fences from model output. */
export function parseModelJson(text: string): unknown {
  let trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return JSON.parse(trimmed) as unknown;
}
