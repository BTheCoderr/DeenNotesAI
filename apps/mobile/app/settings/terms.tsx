import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { CANONICAL_SITE_ORIGIN, LEGAL_TERMS_URL } from "../../src/lib/legal-urls";
import { emerald, fontSizes, spacing } from "../../src/theme";

export default function SettingsTermsScreen() {
  return (
    <SettingsDocScreen title="Terms">
      <P>By using DeenNotes you agree to these practical expectations (TestFlight summary):</P>
      <P>• The app is for education, reflection, and personal organisation — not a substitute for scholars, imāms, clinicians, or lawyers.</P>
      <P>• Nothing in the product is religious verdict, medical, or legal advice. Seek qualified people when it matters.</P>
      <P>• Subscriptions are billed and managed by Apple; entitlements sync through RevenueCat according to App Store rules.</P>
      <P>• Use DeenNotes respectfully: no abuse of people, no scraping or reverse-engineering to harm the service, no misuse of shared content.</P>
      <P>
        • Qur&apos;ān text, audio, tafsīr excerpts, and prayer times may come from third-party sources — wording, audio, and timings can differ slightly by method or region.
      </P>
      <P>Thank you for carrying a calm, adab-first tone inside the app and in feedback to the team.</P>
      <Pressable
        onPress={() => void Linking.openURL(LEGAL_TERMS_URL).catch(() => {})}
        accessibilityRole="link"
        accessibilityLabel="Open terms on the web"
      >
        <Text style={styles.link}>Terms on the web</Text>
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
