export type LearningModePreferences = {
  schemaVersion: 1;
  enabled: boolean;
};

export const DEFAULT_LEARNING_MODE: LearningModePreferences = {
  schemaVersion: 1,
  enabled: false,
};

export const LEARNING_MODE_DISCLAIMER =
  "Learning mode uses gentle language for people new to Islam. It does not replace scholars, local imams, or formal guidance.";
