import Constants from "expo-constants";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";

export default function SettingsAboutScreen() {
  const v = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SettingsDocScreen title="About">
      <P>
        Version {v}. DeenNotes helps Muslims capture khutbahs, reflections, Qur&apos;an notes, prayer routines, and
        reminders in one calm place — for reflection, organization, and learning support alongside your worship.
      </P>
      <P>
        DeenNotes does not replace qualified scholars, imām-s, or local masjid leadership. Use it to organise what you
        heard, what you read, and what you intend to act on — then turn to trustworthy people for rulings, counselling,
        or community decisions.
      </P>
    </SettingsDocScreen>
  );
}
