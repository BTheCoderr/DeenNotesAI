import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { P, Q, SettingsDocScreen } from "../../src/components/settings/SettingsDocScreen";

import { emerald, fontSizes, spacing } from "../../src/theme";

export default function SettingsFaqScreen() {
  return (
    <SettingsDocScreen title="FAQ">
      <Q>What is DeenNotes?</Q>
      <P>
        A private-first companion for Muslims: capture khutbahs and reminders, jot Qur&apos;an reflections, see prayer
        times, and keep notes organized — mobile and web share the same calm direction.
      </P>

      <Q>Is DeenNotes a fatwā app?</Q>
      <P>
        No. DeenNotes does not issue rulings or replace your imām, scholar, or local authority. It helps you remember,
        organise, and learn — verify religious questions with trustworthy people offline or through proper channels.
      </P>

      <Q>How do Qur&apos;an reflections work?</Q>
      <P>
        You choose verses you are sitting with, add notes respectfully beside Arabic (and translation when available),
        and save reflections privately. Anything you sync follows your account; nothing is posted publicly unless you
        choose to share outside the app.
      </P>

      <Q>How do prayer reminders work?</Q>
      <P>
        If you allow notifications, we schedule quiet local alerts from your saved calculation method and location — no
        ads, no marketing. You can turn them off anytime; in-app times still update when you open Today or Prayer.
      </P>

      <Q>How does khutbah recording work?</Q>
      <P>
        On supported builds, Plus members can record on device first. Audio stays local until you move through the flow
        you approve; crafting text from audio follows the same privacy-minded pattern as other capture modes.
      </P>

      <Q>Why do prayer times vary?</Q>
      <P>
        Different regions use different calculation methods, madhhab rules for ʿAṣr, and high-latitude adjustments.
        Pick what matches your community; small differences between apps and timetables are normal.
      </P>

      <Q>What is DeenNotes Plus?</Q>
      <P>
        Plus deepens listening, recording, and planner-style tools (where available) while keeping the same respectful
        defaults. Free paths still cover daily prayer context and core reading — upgrade only if it helps your rhythm.
      </P>

      <Q>How do I restore my subscription?</Q>
      <P>
        On iPhone: inside DeenNotes, open Settings using the gear icon → Account → Restore purchases. You can also
        manage subscriptions in Apple ID → Subscriptions. RevenueCat verifies your receipt so Plus restores on this
        device.
      </P>

      <P>Still stuck? Use Feedback — we answer TestFlight mail with priority.</P>

      <Pressable
        style={styles.linkBtn}
        onPress={() => void Linking.openURL("https://deennotesai.netlify.app/contact").catch(() => {})}
        accessibilityRole="link"
      >
        <Text style={styles.linkTxt}>Open contact form</Text>
      </Pressable>
    </SettingsDocScreen>
  );
}

const styles = StyleSheet.create({
  linkBtn: { alignSelf: "flex-start", marginTop: spacing.sm, paddingVertical: spacing.sm },
  linkTxt: { fontSize: fontSizes.md, fontWeight: "800", color: emerald },
});
