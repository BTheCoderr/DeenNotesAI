import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";

export default function SettingsFaqScreen() {
  return (
    <SettingsDocScreen title="FAQ">
      <P>
        Why sign in? So reflections you craft on mobile land in the same library as your web notebooks — Arabic first,
        English prompts optional, nothing posted publicly without you.
      </P>
      <P>
        Where does khutbah audio go? Locally on-device until erased. Turning audio into prose uses the same safeguards as
        other capture modes once you approve sending text to craft a reflection.
      </P>
      <P>
        Need more answered? Ping us from Feedback — we iterate in public beta with care.
      </P>
    </SettingsDocScreen>
  );
}
