import Constants from "expo-constants";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import {
  CANONICAL_SITE_ORIGIN,
  LEGAL_CONTACT_URL,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
} from "../../src/lib/legal-urls";
import { border, emerald, fontSizes, ink, spacing, stone } from "../../src/theme";

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
      <View style={styles.supportBlock}>
        <Text style={styles.supportK}>Help & legal</Text>
        <Pressable
          style={styles.btn}
          onPress={() => void Linking.openURL(LEGAL_CONTACT_URL).catch(() => {})}
          accessibilityRole="button"
          accessibilityLabel="Contact support"
        >
          <Text style={styles.btnTxt}>Contact support</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => void Linking.openURL(LEGAL_PRIVACY_URL).catch(() => {})}
          accessibilityRole="button"
          accessibilityLabel="Open privacy policy"
        >
          <Text style={styles.btnTxtSecondary}>Privacy policy</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => void Linking.openURL(LEGAL_TERMS_URL).catch(() => {})}
          accessibilityRole="button"
          accessibilityLabel="Open terms of use"
        >
          <Text style={styles.btnTxtSecondary}>Terms of use</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSecondary, styles.btnLast]}
          onPress={() => void Linking.openURL(CANONICAL_SITE_ORIGIN).catch(() => {})}
          accessibilityRole="button"
          accessibilityLabel="Open DeenNotes website"
        >
          <Text style={styles.btnTxtSecondary}>Open website</Text>
        </Pressable>
      </View>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  supportBlock: { gap: spacing.sm, marginTop: spacing.md },
  supportK: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#b8860b",
  },
  btn: {
    backgroundColor: emerald,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: stone,
    borderWidth: 1,
    borderColor: border,
  },
  btnLast: { marginBottom: 0 },
  btnTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  btnTxtSecondary: { color: ink, fontWeight: "700", fontSize: fontSizes.md },
});
