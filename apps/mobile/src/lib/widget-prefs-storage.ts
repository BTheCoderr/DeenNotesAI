import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_WIDGET_PREFS,
  type WidgetPreferencesV1,
} from "../contracts/widget-preferences";

const KEY = "deennotes.mobile.prefs.widget.v1";

export async function readWidgetPreferences(): Promise<WidgetPreferencesV1> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_WIDGET_PREFS;
    const o = JSON.parse(raw) as Partial<WidgetPreferencesV1>;
    if (o.schemaVersion !== 1) return DEFAULT_WIDGET_PREFS;
    return {
      ...DEFAULT_WIDGET_PREFS,
      ...o,
      schemaVersion: 1,
    };
  } catch {
    return DEFAULT_WIDGET_PREFS;
  }
}

export async function writeWidgetPreferences(next: Partial<WidgetPreferencesV1>): Promise<void> {
  const prev = await readWidgetPreferences();
  const merged: WidgetPreferencesV1 = {
    ...DEFAULT_WIDGET_PREFS,
    ...prev,
    ...next,
    schemaVersion: 1,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}
