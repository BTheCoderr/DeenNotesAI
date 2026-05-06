import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMobileSession } from "../../src/hooks/useMobileSession";
import { supabase } from "../../src/lib/supabase";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSerifHeading,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../../src/theme";

type Ion = ComponentProps<typeof Ionicons>["name"];

const ONBOARDING_KEY = "deennotes.mobile.onboarding.v1";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionK}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function ChevRow({
  icon,
  title,
  subtitle,
  href,
  onPress,
  last,
}: {
  icon: Ion;
  title: string;
  subtitle?: string;
  href?: Href;
  onPress?: () => void;
  last?: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.row, last && styles.rowLast]}
      onPress={onPress ?? (href ? () => router.push(href) : undefined)}
      accessibilityRole="button"
      hitSlop={{ top: 4, bottom: 4 }}
    >
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={22} color={emerald} />
      </View>
      <View style={styles.rowTxt}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color={muted} />
    </Pressable>
  );
}

export default function SettingsIndexScreen() {
  const router = useRouter();
  const auth = useMobileSession();
  const [busy, setBusy] = useState(false);

  async function replayOnboarding() {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    router.replace("/onboarding");
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
    }
  }

  const email = auth.ready ? auth.session?.user?.email : null;
  const signedIn = Boolean(auth.ready && auth.accessToken && email);

  return (
    <SafeAreaView style={styles.wrap} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Settings</Text>

        <View style={styles.plusCard} accessibilityRole="text">
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>Beta</Text>
          </View>
          <Text style={styles.plusTitle}>DeenNotes Plus</Text>
          <Text style={styles.plusSub}>
            Unlock deeper reflection, Qur&apos;an tools, and offline listening — calm memberships, never noisy streaks.
          </Text>
          <Text style={styles.plusHint}>Coming soon</Text>
        </View>

        <Section title="Account">
          {signedIn ? (
            <View style={[styles.accountBlock, styles.rowLast]}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="person-outline" size={22} color={emerald} />
              </View>
              <View style={styles.rowTxt}>
                <Text style={styles.rowTitle}>{email}</Text>
                <Text style={styles.rowSub}>Reflections sync with the web app on this device.</Text>
              </View>
            </View>
          ) : (
            <ChevRow
              icon="person-outline"
              title="Sign in"
              subtitle="Sync reflections with your DeenNotes account."
              href="/login"
              last
            />
          )}
          <ChevRow icon="shield-outline" title="Privacy" href="/settings/privacy" />
          <ChevRow icon="document-text-outline" title="Terms" href="/settings/terms" />
          <ChevRow icon="heart-outline" title="About DeenNotes" href="/settings/about" last />
          {signedIn ? (
            <Pressable
              style={[styles.signOut, busy && styles.signOutDisabled]}
              onPress={() => void signOut()}
              disabled={busy}
            >
              {busy ? <ActivityIndicator color={emerald} /> : <Text style={styles.signOutTxt}>Sign out</Text>}
            </Pressable>
          ) : null}
        </Section>

        <Section title="Worship">
          <ChevRow icon="time-outline" title="Prayer preferences" subtitle="Methods, times, manual city" href="/settings/prayer" />
          <ChevRow
            icon="notifications-outline"
            title="Prayer reminders"
            subtitle="Quiet prompts before each ṣalāh"
            href="/settings/prayer"
          />
          <ChevRow icon="location-outline" title="Location" subtitle="City-level placement for times" href="/settings/location" />
          <ChevRow
            icon="moon-outline"
            title="Hijri calendar & Ramadan"
            subtitle="Month-aware overlays"
            href="/settings/hijri"
            last
          />
        </Section>

        <Section title="Quran">
          <ChevRow icon="settings-outline" title="Quran preferences" subtitle="Reading, audio & cache hub" href="/settings/quran" />
          <ChevRow icon="book-outline" title="Translation language" subtitle="Defaults beside Arabic" href="/quran/settings" />
          <ChevRow icon="library-outline" title="Tafsir" subtitle="Scholarly notes when wired" href="/quran/settings" />
          <ChevRow icon="mic-outline" title="Reciter" subtitle="Narration & quality" href="/quran/settings" />
          <ChevRow icon="archive-outline" title="Offline Quran" subtitle="Cached surahs on-device" href="/settings/offline" />
          <ChevRow
            icon="download-outline"
            title="Audio downloads"
            subtitle="Wi‑Fi guardrails & queueing"
            href="/quran/settings"
            last
          />
        </Section>

        <Section title="Reflection">
          <ChevRow
            icon="sparkles-outline"
            title="Reflection preferences"
            subtitle="Continuity & Today alignment"
            href="/settings/continuity-preferences"
          />
          <ChevRow icon="mic-outline" title="Khutbah recordings" subtitle="On-device audio & craft flow" href="/settings/recordings" />
          <ChevRow icon="reader-outline" title="Saved reflections" subtitle="Open Reflect tab" href="/(tabs)/reflect" />
          <ChevRow icon="folder-outline" title="Folders" subtitle="Library organisation (planned)" href="/settings/folders" last />
        </Section>

        <Section title="Support">
          <ChevRow icon="help-circle-outline" title="FAQ" href="/settings/faq" />
          <ChevRow icon="chatbubble-ellipses-outline" title="Feedback" href="/settings/feedback" />
          <ChevRow icon="paper-plane-outline" title="Invite a friend" href="/settings/invite" />
          <ChevRow
            icon="phone-portrait-outline"
            title="Home screen widgets"
            subtitle="iOS previews & payloads"
            href="/settings/widget-preferences"
            last
          />
        </Section>

        <Pressable style={styles.footerLink} onPress={() => void replayOnboarding()}>
          <Text style={styles.footerLinkTxt}>Replay onboarding</Text>
        </Pressable>
        {__DEV__ ? (
          <Pressable style={styles.footerLink} onPress={() => router.push("/internal/qa")}>
            <Text style={[styles.footerLinkTxt, { opacity: 0.8 }]}>Internal QA checklist</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: stone },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },

  screenTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xxl,
    fontWeight: "600",
    color: ink,
    marginTop: spacing.sm,
  },

  plusCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.35)",
    backgroundColor: "rgba(184,134,11,0.06)",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(18,122,99,0.12)",
    borderWidth: 1,
    borderColor: "rgba(18,122,99,0.25)",
  },
  badgeTxt: { fontSize: fontSizes.xs, fontWeight: "800", color: emerald },
  plusTitle: { fontFamily: fontSerifHeading, fontSize: fontSizes.xl, fontWeight: "600", color: ink },
  plusSub: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  plusHint: { fontSize: fontSizes.xs, fontWeight: "800", color: bronze, marginTop: spacing.xs },

  section: { gap: spacing.sm },
  sectionK: {
    fontSize: 11,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border,
    gap: spacing.md,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIconWrap: { width: 28, alignItems: "center" },
  rowTxt: { flex: 1 },
  rowTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  rowSub: { fontSize: fontSizes.sm, color: muted, marginTop: 2, lineHeight: 18 },

  accountBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border,
    gap: spacing.md,
  },

  signOut: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
  },
  signOutDisabled: { opacity: 0.6 },
  signOutTxt: { fontWeight: "800", fontSize: fontSizes.md, color: ink },

  footerLink: { alignSelf: "center", paddingVertical: spacing.lg },
  footerLinkTxt: { fontWeight: "800", color: emerald, fontSize: fontSizes.sm },
});
