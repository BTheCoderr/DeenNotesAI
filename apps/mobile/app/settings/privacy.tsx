import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { CANONICAL_SITE_ORIGIN, LEGAL_PRIVACY_URL } from "../../src/lib/legal-urls";
import { emerald, fontSizes, spacing } from "../../src/theme";

export default function SettingsPrivacyScreen() {
  return (
    <SettingsDocScreen title="Privacy">
      <P>In short, DeenNotes is built to respect your worship and your data:</P>
      <P>• Account details if you sign in (for example email via our auth provider).</P>
      <P>• Reflections and notes you create or sync.</P>
      <P>• Prayer preferences and the location choice you save for timings.</P>
      <P>
        • Purchase status through Apple and RevenueCat (we do not receive your full card number).
      </P>
      <P>• We do not sell personal data or use it for ad profiles.</P>
      <P>
        Qur&apos;ān passages, reflections, and reminders should be treated as private — share them only in ways you intend.
      </P>
      <P>
        A fuller policy may live on our site as the product grows; the lines above are the TestFlight summary we stand
        behind today.
      </P>
      <Pressable
        onPress={() => void Linking.openURL(LEGAL_PRIVACY_URL).catch(() => {})}
        accessibilityRole="link"
        accessibilityLabel="Open privacy policy on the web"
      >
        <Text style={styles.link}>Privacy policy on the web</Text>
      </Pressable>
      <Pressable
        style={styles.secondary}
        onPress={() => void Linking.openURL(CANONICAL_SITE_ORIGIN).catch(() => {})}
        accessibilityRole="link"
      >
        <Text style={styles.linkMuted}>Open DeenNotes home</Text>
      </Pressable>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: fontSizes.md, fontWeight: "800", color: emerald, marginTop: spacing.sm },
  secondary: { marginTop: spacing.md },
  linkMuted: { fontSize: fontSizes.md, fontWeight: "700", color: emerald, opacity: 0.85 },
});
