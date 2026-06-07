import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_LEARNING_MODE,
  type LearningModePreferences,
} from "../contracts/learning-mode";

const KEY = "deennotes.mobile.learningMode.v1";

export async function readLearningMode(): Promise<LearningModePreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_LEARNING_MODE };
    const o = JSON.parse(raw) as Partial<LearningModePreferences>;
    return {
      schemaVersion: 1,
      enabled: Boolean(o.enabled),
    };
  } catch {
    return { ...DEFAULT_LEARNING_MODE };
  }
}

export async function writeLearningMode(
  patch: Partial<Pick<LearningModePreferences, "enabled">>,
): Promise<LearningModePreferences> {
  const current = await readLearningMode();
  const next: LearningModePreferences = {
    schemaVersion: 1,
    enabled: patch.enabled ?? current.enabled,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
