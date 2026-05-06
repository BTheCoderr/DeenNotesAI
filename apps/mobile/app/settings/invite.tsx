import { Share, Pressable, StyleSheet, Text } from "react-native";

import { P, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";
import { emerald, fontSizes, spacing } from "../../src/theme";

const INVITE_URL = "https://deennotesai.netlify.app/app";

export default function SettingsInviteScreen() {
  async function invite() {
    await Share.share({
      message: `Try DeenNotes — calm Qur'an reading and private reflections.\n${INVITE_URL}`,
      url: INVITE_URL,
    });
  }

  return (
    <SettingsDocScreen title="Invite a friend">
      <P>
        Share the same gentle pace you enjoy: Today for prayer context, Qur&apos;an for slow reading, Reflect for your
        heart-notes — none of it broadcasts unless someone chooses it.
      </P>
      <Pressable style={styles.btn} onPress={() => void invite()}>
        <Text style={styles.btnTxt}>Share invite link</Text>
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
