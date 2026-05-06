/**
 * Gentle return cues — avoid streak pressure (no loss aversion, no “keep the chain”).
 */
export type ContinuityPreferencesV1 = {
  schemaVersion: 1;
  showReturnToday: boolean;
  showLastReflectionRecap: boolean;
  /** When true, omit day-count style language entirely. */
  preferMinimalCopy: boolean;
};

export const DEFAULT_CONTINUITY_PREFS: ContinuityPreferencesV1 = {
  schemaVersion: 1,
  showReturnToday: true,
  showLastReflectionRecap: true,
  preferMinimalCopy: false,
};
