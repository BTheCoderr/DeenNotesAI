import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_CONTINUITY_PREFS,
  type ContinuityPreferencesV1,
} from "../contracts/continuity-preferences";

const KEY = "deennotes.mobile.prefs.continuity.v1";

export async function readContinuityPreferences(): Promise<ContinuityPreferencesV1> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONTINUITY_PREFS;
    const o = JSON.parse(raw) as Partial<ContinuityPreferencesV1>;
    if (o.schemaVersion !== 1) return DEFAULT_CONTINUITY_PREFS;
    return {
      ...DEFAULT_CONTINUITY_PREFS,
      ...o,
      schemaVersion: 1,
    };
  } catch {
    return DEFAULT_CONTINUITY_PREFS;
  }
}

export async function writeContinuityPreferences(
  next: Partial<ContinuityPreferencesV1>,
): Promise<void> {
  const prev = await readContinuityPreferences();
  const merged: ContinuityPreferencesV1 = {
    ...DEFAULT_CONTINUITY_PREFS,
    ...prev,
    ...next,
    schemaVersion: 1,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}
