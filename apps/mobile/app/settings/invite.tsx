import { Share, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { emerald, fontSizes, spacing } from "../../src/theme";

const INVITE_URL = "https://deennotesai.netlify.app/app";

export default function SettingsInviteScreen() {
  async function invite() {
    await Share.share({
      message: `DeenNotes — Qur’an reading, prayer rhythm, and private reflections in one gentle app.\n${INVITE_URL}`,
      url: INVITE_URL,
    });
  }

  return (
    <SettingsDocScreen title="Invite a friend">
      <P>
        Share DeenNotes with someone who wants a calmer Qur&apos;an, prayer, and reflection habit — nothing flashy, just
        space to return to what matters.
      </P>
      <Pressable
        style={styles.btn}
        onPress={() => void invite()}
        accessibilityRole="button"
        accessibilityLabel="Share invite"
      >
        <Text style={styles.btnTxt}>Share invite</Text>
      </Pressable>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    backgroundColor: emerald,
    borderRadius: 999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
    justifyContent: "center",
  },
  btnTxt: { fontSize: fontSizes.md, fontWeight: "800", color: "#fff" },
});
