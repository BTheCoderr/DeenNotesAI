/**
 * Local-only khutbah capture metadata (M5A).
 * Future: transcriptionId, segmentRanges, speakerHints, checksum, syncedRemoteId — keep fields additive.
 */

export type KhutbahRecordingSchemaVersion = 1;

export type KhutbahRecordingSource = "record_khutbah_session";

export type KhutbahRecordingMeta = {
  schemaVersion: KhutbahRecordingSchemaVersion;
  id: string;
  /** Writable path under documentDirectory — persists across sessions. */
  fileUri: string;
  durationMillis: number;
  createdAt: string;
  /** User-editable later from detail screen */
  title?: string;
  /** Supabase reflection id once generate-note succeeds (local bookkeeping only until cloud audio exists). */
  linkedReflectionId?: string | null;
  source: KhutbahRecordingSource;
};

export const KHUTBAH_ATTACHMENT_LINE_PREFIX =
  "Recorded during this khutbah (local audio on device; no transcription yet).";
