import type { KhutbahRecordingMeta } from "../contracts/khutbah-recording";
import { KHUTBAH_ATTACHMENT_LINE_PREFIX } from "../contracts/khutbah-recording";

export function formatDurationShort(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

/**
 * Stable prefix for prompts + future transcript injection (append after this block).
 */
export function composeKhutbahReflectionRawInput(userNotes: string, meta: KhutbahRecordingMeta): string {
  const dur = formatDurationShort(meta.durationMillis);
  const header = `${KHUTBAH_ATTACHMENT_LINE_PREFIX} Duration ~${dur}. Recording id ${meta.id} (local).\n`;
  const body = userNotes.trim();
  if (!body) {
    return `${header}\nWhat I want to remember from this khutbah (add below on replay):\n`;
  }
  return `${header}\n${body}`;
}
