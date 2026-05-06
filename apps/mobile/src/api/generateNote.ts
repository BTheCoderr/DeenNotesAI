import { apiUrl } from "../lib/apiBase";

export type GenerateNoteBody = {
  noteType:
    | "khutbah"
    | "lecture"
    | "quran_reflection"
    | "halaqa"
    | "personal_reminder";
  rawInput: string;
};

export type GenerateNoteResponse = { noteId: string } | { error: string };

export async function postGenerateNote(
  accessToken: string,
  body: GenerateNoteBody,
): Promise<{ noteId: string }> {
  const res = await fetch(apiUrl("/api/generate-note"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as GenerateNoteResponse;

  if (!res.ok || !data || typeof data !== "object" || !("noteId" in data)) {
    const msg =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Could not generate your reflection.";
    throw new Error(msg);
  }

  return { noteId: data.noteId };
}
