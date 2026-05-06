/**
 * Deferred M5E: structured juz checkpoints for Ramadan pacing.
 * No UI yet — schema reserved for syncing/progress continuity.
 */

export type JuzProgressV1 = {
  schemaVersion: 1;
  approxJuzAtLastCheckpoint?: number;
  checkpointSurah?: number;
  checkpointAyah?: number;
  updatedAt?: number;
};
