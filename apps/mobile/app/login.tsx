import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { safeBack } from "../src/lib/navigation/safe-back";
import { COPY_ACCOUNT_SYNC_UNAVAILABLE } from "../src/contracts/review-user-copy";
import { getLegalPrivacyUrl, getLegalTermsUrl } from "../src/lib/purchases/expo-extra";
import { supabase } from "../src/lib/supabase";
import {
  cardBg,
  border,
  emerald,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    if (!supabase) {
      setErr(COPY_ACCOUNT_SYNC_UNAVAILABLE);
      return;
    }
    const e = email.trim();
    const p = password.trim();
    if (!e || !p) {
      setErr("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace("/(tabs)/reflect");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inner}>
          <Text style={styles.h1}>Sign in to sync</Text>
          <Text style={styles.lead}>Use your DeenNotes account to sync reflections with the web.</Text>

          {!supabase ? (
            <Text style={styles.err}>{COPY_ACCOUNT_SYNC_UNAVAILABLE}</Text>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={muted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!busy}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!busy}
              />
              {err ? <Text style={styles.err}>{err}</Text> : null}
              <Pressable
                style={[styles.primary, busy && styles.primaryDisabled]}
                onPress={() => void onSubmit()}
                disabled={busy}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryTxt}>Continue</Text>
                )}
              </Pressable>
            </>
          )}
          <View style={{ flex: 1 }} />
          <View style={styles.legalFoot}>
            <Text style={styles.legalMuted}>
              By continuing you agree to our{" "}
              <Text
                accessibilityRole="link"
                style={styles.legalLink}
                onPress={() => void Linking.openURL(getLegalTermsUrl()).catch(() => {})}
              >
                Terms of Use
              </Text>
              {" "}and acknowledge the{" "}
              <Text
                accessibilityRole="link"
                style={styles.legalLink}
                onPress={() => void Linking.openURL(getLegalPrivacyUrl()).catch(() => {})}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
          <Pressable onPress={() => safeBack(router, navigation, "/(tabs)")} style={styles.ghost}>
            <Text style={styles.ghostTxt}>Not now</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  flex: { flex: 1 },
  inner: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  h1: { fontSize: 28, fontWeight: "800", color: ink },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: cardBg,
  },
  err: { fontSize: fontSizes.sm, color: "#b45309", lineHeight: 20 },
  primary: {
    backgroundColor: emerald,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryDisabled: { opacity: 0.7 },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  ghost: { alignSelf: "flex-start", paddingVertical: spacing.sm },
  ghostTxt: { color: emerald, fontWeight: "700", fontSize: fontSizes.sm },
  legalFoot: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  legalMuted: {
    fontSize: 11,
    color: muted,
    lineHeight: 16,
    textAlign: "center",
  },
  legalLink: {
    color: emerald,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
