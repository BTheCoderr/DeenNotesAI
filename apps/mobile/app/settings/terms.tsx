import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { emerald, fontSizes } from "../../src/theme";

export default function SettingsTermsScreen() {
  return (
    <SettingsDocScreen title="Terms">
      <P>
        DeenNotes offers spiritual tooling — not clergy, counselling, or medical advice. Pause with a trusted scholar,
        clinician, or imām when hearts feel heavy beyond what software can honour.
      </P>
      <P>
        Publishing full terms of service for the hosted product continues on the web; this stub keeps orientation clear in
        the app while those pages ship.
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
