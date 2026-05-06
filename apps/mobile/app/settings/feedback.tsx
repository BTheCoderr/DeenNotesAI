import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { emerald, fontSizes, spacing } from "../../src/theme";

export default function SettingsFeedbackScreen() {
  const contact = () => void Linking.openURL("https://deennotesai.netlify.app/contact").catch(() => {});

  return (
    <SettingsDocScreen title="Feedback">
      <P>
        Tell us what felt reverent and what interrupted your flow — especially around prayer timing, Qur&apos;an reading, or
        reflection capture after jumu&apos;ah.
      </P>
      <Pressable style={styles.btn} onPress={contact}>
        <Text style={styles.btnTxt}>Open contact page</Text>
      </Pressable>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  btn: { alignSelf: "flex-start", marginTop: spacing.md },
  btnTxt: { fontSize: fontSizes.md, fontWeight: "800", color: emerald },
});
