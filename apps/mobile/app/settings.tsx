import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { emerald, fontSizes, ink, muted, spacing, stone } from "../src/theme";

const DONE_KEY = "deennotes.mobile.onboarding.v1";

export default function SettingsScreen() {
  const router = useRouter();

  async function replayOnboarding() {
    await AsyncStorage.removeItem(DONE_KEY);
    router.replace("/onboarding");
  }

  return (
    <SafeAreaView style={styles.wrap} edges={["top", "left", "right"]}>
      <Text style={styles.h1}>Settings</Text>
      <Text style={styles.body}>
        Profile, prayer & Quran preferences will consolidate here alongside the web app — this is a
        calm placeholder shell.
      </Text>
      <Pressable onPress={() => void replayOnboarding()} style={styles.btn}>
        <Text style={styles.btnTxt}>Replay onboarding</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.xl, backgroundColor: stone },
  h1: { fontSize: 28, fontWeight: "800", color: ink, marginBottom: spacing.sm },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 22, marginBottom: spacing.lg },
  btn: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
    minHeight: 48,
    justifyContent: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
});
