import { useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resolveBetaFeedbackInboxEmail } from "../../src/lib/purchases/expo-extra";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  minTouchTarget,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

const CATEGORIES = [
  "Subscription / DeenNotes Plus",
  "Paywall timing or copy",
  "Prayer times or reminders",
  "Quran reading or listening",
  "Reflection compose / sync",
  "Something else gently",
] as const;

const FEEDBACK_INBOX_MISSING_HINT =
  "Beta feedback inbox is not configured for this build. Configure a feedback recipient before distributing to testers.";
const MAIL_NEEDS_CONTACT = "Add your email address so we can reply with care.";

export default function BetaFeedbackScreen() {
  const router = useRouter();
  const inbox = resolveBetaFeedbackInboxEmail();
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Set<(typeof CATEGORIES)[number]>>(new Set());
  const [notes, setNotes] = useState("");

  /** Production builds redirect away immediately (surface is developer-only). */
  useLayoutEffect(() => {
    if (!__DEV__) {
      router.replace("/settings");
    }
  }, [router]);

  const toggle = useCallback((cat: (typeof CATEGORIES)[number]) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(cat)) n.delete(cat);
      else n.add(cat);
      return n;
    });
  }, []);

  const canSend = inbox.length > 0 && email.trim().includes("@");

  const bodyPreview = useMemo(() => {
    const lines: string[] = [];
    lines.push("DeenNotes beta feedback (TestFlight)");
    lines.push("");
    lines.push(`Reply-to / contact: ${email.trim()}`);
    lines.push("");
    lines.push("Categories:");
    for (const c of CATEGORIES) {
      lines.push(`${selected.has(c) ? "[x]" : "[ ]"} ${c}`);
    }
    lines.push("");
    lines.push("Notes:");
    lines.push(notes.trim() || "(none)");
    lines.push("");
    lines.push("Screenshot hint: Capture with device controls, attach from the Mail composer.");
    return lines.join("\n");
  }, [email, notes, selected]);

  if (!__DEV__) {
    return null;
  }

  function openComposer() {
    if (!canSend) {
      Alert.alert(
        "Needs attention",
        inbox ? MAIL_NEEDS_CONTACT : FEEDBACK_INBOX_MISSING_HINT,
      );
      return;
    }
    const subject = encodeURIComponent("DeenNotes beta feedback");
    const body = encodeURIComponent(bodyPreview);
    const addr = inbox.trim().split(",")[0] ?? inbox;
    const url = `mailto:${encodeURIComponent(addr)}?subject=${subject}&body=${body}`;
    if (url.length > 7500) {
      Alert.alert("Message too long", "Shorten your notes gently and try again.");
      return;
    }
    void Linking.openURL(url).catch(() => {
      Alert.alert("Mail not available", "Open your mail client manually and paste this summary.", [
        { text: "OK" },
      ]);
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Send feedback</Text>
        <Text style={styles.lead}>
          Real Device flight notes help us keep navigation, subscriptions, and tone aligned with how you worship.
          Nothing devotional is transmitted automatically — only what you compose here.
        </Text>

        <View style={styles.card}>
          <Text style={styles.k}>Reply email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@domain.com"
            placeholderTextColor={muted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel="Your email address for replies"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>What surfaced?</Text>
          <Text style={styles.helper}>Tap all that resonate — concise categories only.</Text>
          <View style={styles.wrap}>
            {CATEGORIES.map((cat) => {
              const on = selected.has(cat);
              return (
                <Pressable
                  key={cat}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => toggle(cat)}
                  style={[styles.tag, on && styles.tagOn]}
                >
                  <Text style={[styles.tagTxt, on && styles.tagTxtOn]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Screenshots</Text>
          <Text style={styles.body}>
            On iPhone capture with Volume up + Side button. If you include the image, attach it manually from Mail
            after this sheet opens — we never pull photos without your gesture.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.k}>Anything else calmly?</Text>
          <TextInput
            style={[styles.input, styles.notes]}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Gentle context (optional)"
            placeholderTextColor={muted}
            accessibilityLabel="Optional notes"
          />
        </View>

        {!inbox ? <Text style={styles.warn}>{FEEDBACK_INBOX_MISSING_HINT}</Text> : null}

        <Pressable
          style={[styles.cta, !canSend && styles.ctaMuted]}
          onPress={openComposer}
          disabled={!canSend}
          accessibilityRole="button"
        >
          <Text style={styles.ctaTxt}>Open Mail with this summary</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ minHeight: minTouchTarget }}>
          <Text style={styles.back}>Back without sending</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 56, gap: spacing.md },
  h1: { fontFamily: fontSerifHeading, fontSize: 26, fontWeight: "600", color: ink },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  k: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  helper: { fontSize: fontSizes.sm, color: muted },
  body: { fontSize: fontSizes.sm, color: ink, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: stone,
  },
  notes: { minHeight: 112, textAlignVertical: "top" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tag: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: stone,
  },
  tagOn: { borderColor: emerald, backgroundColor: "rgba(18,122,99,0.1)" },
  tagTxt: { fontSize: fontSizes.sm, color: ink, fontWeight: "600" },
  tagTxtOn: { color: emerald },
  warn: { fontSize: fontSizes.sm, color: muted, fontWeight: "700", lineHeight: 20 },
  cta: {
    backgroundColor: emerald,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaMuted: { opacity: 0.45 },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: fontSizes.md },
  back: {
    alignSelf: "center",
    color: emerald,
    fontWeight: "800",
    fontSize: fontSizes.sm,
    paddingVertical: spacing.md,
    textAlign: "center",
  },
});
