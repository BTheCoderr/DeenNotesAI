import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { LEGAL_CONTACT_URL } from "../../src/lib/legal-urls";
import { emerald, fontSizes, spacing } from "../../src/theme";

export default function SettingsFeedbackScreen() {
  const contact = () => void Linking.openURL(LEGAL_CONTACT_URL).catch(() => {});

  return (
    <SettingsDocScreen title="Feedback">
      <P>
        We read every message with care. Send bugs, feature ideas, prayer-time surprises, Qur&apos;an reader or audio
        quirks, subscription or restore issues, or general thoughts on how DeenNotes should feel calmer and more respectful.
      </P>
      <P>The contact form opens in your browser — describe what you expected and what you saw so we can reproduce it.</P>
      <Pressable style={styles.btn} onPress={contact} accessibilityRole="button" accessibilityLabel="Open feedback form">
        <Text style={styles.btnTxt}>Open contact form</Text>
      </Pressable>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: emerald,
    borderRadius: 999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
    justifyContent: "center",
  },
  btnTxt: { fontSize: fontSizes.md, fontWeight: "800", color: emerald },
});
