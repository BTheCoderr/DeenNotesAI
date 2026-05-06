import Constants from "expo-constants";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";

export default function SettingsAboutScreen() {
  const v = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SettingsDocScreen title="About DeenNotes">
      <P>
        Version {v}. DeenNotes pairs calm Qur&apos;an reading with private reflections — web and mobile honour the same gentle
        contracts so your notebook never feels fractured.
      </P>
      <P>
        Built slowly: prayer-aware surfaces, Reverent Offline copies of what you revisit, khutbah capture that never
        rushes uploads, and heart-led prompts that defer to scholars for fiqh edge cases.
      </P>
    </SettingsDocScreen>
  );
}
