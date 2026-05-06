import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { emerald, fontSizes } from "../../src/theme";

export default function SettingsPrivacyScreen() {
  return (
    <SettingsDocScreen title="Privacy">
      <P>
        DeenNotes is built around private-first rhythms: Qur&apos;an reading, reflections, and local recordings stay with
        you until you deliberately sync or export them.
      </P>
      <P>
        We avoid turning your spirituality into behavioural ads. When a full legal page is published on the site, you
        can open it here for your records.
      </P>
      <Pressable onPress={() => void Linking.openURL("https://deennotesai.netlify.app")}>
        <Text style={styles.link}>Open DeenNotes web</Text>
      </Pressable>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: fontSizes.md, fontWeight: "800", color: emerald },
});
