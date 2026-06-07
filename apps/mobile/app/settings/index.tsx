import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { deleteAccountOnServer } from "../../src/api/deleteAccount";
import { DeenNotesAppIconMark } from "../../src/components/brand/DeenNotesAppIconMark";
import {
  COPY_ACCOUNT_DELETE_UNAVAILABLE,
  COPY_RESTORE_INCOMPLETE,
  COPY_SUBSCRIPTIONS_UNAVAILABLE,
} from "../../src/contracts/review-user-copy";
import { useMobileSession } from "../../src/hooks/useMobileSession";
import { usePremium } from "../../src/hooks/usePremium";
import { clearAllLocalPersistedAppData } from "../../src/lib/account/clear-local-user-state";
import { logoutRevenueCatIfConfigured } from "../../src/lib/purchases/revenuecat-bootstrap";
import { supabase } from "../../src/lib/supabase";
import { QIBLA_ROUTE, WIDGET_PREFERENCES_ROUTE } from "../../src/contracts/nav";
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
const DELETE_CONFIRM_PHRASE = "DELETE";

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
  const {
    openPaywall,
    isPremium,
    purchasesAvailable,
    restorePurchases,
    refreshPremiumStatus,
  } = usePremium();
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTyping, setDeleteTyping] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function replayOnboarding() {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    router.replace("/onboarding");
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    try {
      await logoutRevenueCatIfConfigured();
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
    }
  }

  async function runAccountDeletion() {
    if (!supabase || !auth.accessToken) {
      Alert.alert("Not signed in", "Sign in again, then delete your account if you still want to.");
      return;
    }
    if (deleteTyping.trim() !== DELETE_CONFIRM_PHRASE) return;

    setDeletingAccount(true);
    try {
      await deleteAccountOnServer(auth.accessToken);
      await logoutRevenueCatIfConfigured();
      await refreshPremiumStatus();
      await supabase.auth.signOut();
      await clearAllLocalPersistedAppData();
      setDeleteOpen(false);
      setDeleteTyping("");
      Alert.alert("Account deleted", "Your DeenNotes account and synced server data have been removed.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch {
      Alert.alert("Could not delete account", COPY_ACCOUNT_DELETE_UNAVAILABLE);
    } finally {
      setDeletingAccount(false);
    }
  }

  async function onRestorePurchases() {
    if (!purchasesAvailable) {
      Alert.alert("Restore purchases", COPY_SUBSCRIPTIONS_UNAVAILABLE);
      return;
    }
    setRestoring(true);
    try {
      const active = await restorePurchases();
      if (active) {
        Alert.alert(
          "DeenNotes Plus is active",
          "Your subscription was restored. Thank you for supporting calmer Quran, prayer, and reflection.",
        );
      } else {
        Alert.alert(
          "No active subscription found",
          "We didn’t find an active DeenNotes Plus entitlement on this Apple ID for this device. If you subscribed with a different Apple ID or the purchase is pending, sign in correctly or wait a moment and try again.",
        );
      }
    } catch {
      Alert.alert("Couldn't restore", COPY_RESTORE_INCOMPLETE);
    } finally {
      setRestoring(false);
    }
  }

  function onSubscriptionPress() {
    if (!purchasesAvailable) {
      Alert.alert("Subscriptions", COPY_SUBSCRIPTIONS_UNAVAILABLE);
      return;
    }
    if (isPremium) {
      Alert.alert(
        "DeenNotes Plus",
        "Thank you — your privileges are active. Manage or cancel anytime in Settings → Apple ID → Subscriptions.",
      );
      return;
    }
    openPaywall("general");
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

        <Section title="Premium">
          <Pressable
            style={styles.plusCard}
            accessibilityRole="button"
            accessibilityLabel="DeenNotes Plus privileges"
            onPress={() => {
              if (!purchasesAvailable) {
                Alert.alert("DeenNotes Plus", COPY_SUBSCRIPTIONS_UNAVAILABLE);
                return;
              }
              if (isPremium) {
                Alert.alert(
                  "DeenNotes Plus",
                  "Your privileges are active. Thank you for supporting calmer reflection.",
                );
                return;
              }
              openPaywall("general");
            }}
          >
            <View style={styles.plusCardBrand}>
              <DeenNotesAppIconMark size={52} accessibilityLabel="DeenNotes" />
              <View style={styles.plusCardBrandText}>
                <View style={styles.badge}>
                  <Ionicons name="sparkles" size={16} color={emerald} style={{ marginRight: 6 }} />
                  <Text style={styles.badgeTxt}>{isPremium ? "Plus · active" : "DeenNotes Plus"}</Text>
                </View>
                <Text style={styles.plusTitle}>My privileges</Text>
              </View>
            </View>
            <Text style={styles.plusSub}>
              {isPremium
                ? "Deeper reflective space and listening — paced for your journey. Thank you for supporting DeenNotes."
                : "Unhurried listening, richer reflection flow, and gentle rhythm across prayer and Quran."}
            </Text>
            {isPremium ? (
              <Text style={styles.plusHint}>Blessed support — privileges are active</Text>
            ) : purchasesAvailable ? (
              <Text style={styles.plusHint}>Tap to explore Plus calmly</Text>
            ) : (
              <Text style={styles.plusHint}>{COPY_SUBSCRIPTIONS_UNAVAILABLE}</Text>
            )}
          </Pressable>
        </Section>

        <Section title="Account">
          {signedIn ? (
            <View style={styles.accountBlock}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="person-outline" size={22} color={emerald} />
              </View>
              <View style={styles.rowTxt}>
                <Text style={styles.rowTitle}>{email}</Text>
                <Text style={styles.rowSub}>Reflections sync with DeenNotes on this device.</Text>
              </View>
            </View>
          ) : (
            <ChevRow
              icon="person-outline"
              title="Account"
              subtitle="Sign in to sync reflections across devices."
              href="/login"
            />
          )}
          <ChevRow
            icon="card-outline"
            title="Subscription"
            subtitle={isPremium ? "DeenNotes Plus active" : "Review or upgrade calmly"}
            onPress={onSubscriptionPress}
          />
          <Pressable
            style={[styles.row, styles.rowLast]}
            onPress={() => void onRestorePurchases()}
            disabled={restoring}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            <View style={styles.rowIconWrap}>
              <Ionicons name="refresh-outline" size={22} color={emerald} />
            </View>
            <View style={styles.rowTxt}>
              <Text style={styles.rowTitle}>Restore purchases</Text>
              <Text style={styles.rowSub}>Reconnect App Store receipts to this device.</Text>
            </View>
            {restoring ? (
              <ActivityIndicator color={emerald} />
            ) : (
              <Ionicons name="chevron-forward" size={22} color={muted} />
            )}
          </Pressable>

          {signedIn ? (
            <Pressable
              style={[styles.signOut, busy && styles.signOutDisabled]}
              onPress={() => void signOut()}
              disabled={busy}
            >
              {busy ? <ActivityIndicator color={emerald} /> : <Text style={styles.signOutTxt}>Sign out</Text>}
            </Pressable>
          ) : null}
          {signedIn ? (
            <Pressable
              style={styles.deleteHint}
              onPress={() => setDeleteOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete account"
            >
              <Text style={styles.deleteHintTxt}>Delete account</Text>
              <Text style={styles.deleteHintSub}>
                Permanently removes your profile, synced reflections, and sign-in. Local device data is wiped. Apple
                subscriptions are managed separately in Settings → Apple ID → Subscriptions.
              </Text>
            </Pressable>
          ) : null}
        </Section>

        <Section title="Preferences">
          <ChevRow
            icon="time-outline"
            title="Prayer preferences"
            subtitle="Prayer times, reminders, location, and calculation method"
            href="/settings/prayer"
          />
          <ChevRow
            icon="book-outline"
            title="Quran preferences"
            subtitle="Reading language, focus mode, recitation, and Ramadan prep"
            href="/quran/settings"
          />
          <ChevRow
            icon="school-outline"
            title="Learning mode"
            subtitle="Gentler copy for people new to Islam"
            href="/settings/learning-mode"
          />
          <ChevRow
            icon="grid-outline"
            title="Widget preferences"
            subtitle="Next prayer, reflection continuity, and home screen context"
            href={WIDGET_PREFERENCES_ROUTE}
          />
          <ChevRow
            icon="location-outline"
            title="Location"
            subtitle="City, country, and precise location settings"
            href="/settings/location"
            last
          />
        </Section>

        <Section title="Worship">
          <ChevRow
            icon="compass-outline"
            title="Qibla compass"
            subtitle="Direction of prayer from your location"
            href={QIBLA_ROUTE}
          />
          <ChevRow icon="calendar-outline" title="Hijri calendar" subtitle="Islamic calendar overlays" href="/settings/hijri" />
          <ChevRow
            icon="moon-outline"
            title="Ramadan settings"
            subtitle="Tarawīh rhythm & fasting context"
            href="/settings/hijri"
            last
          />
        </Section>

        <Section title="Quran">
          <ChevRow
            icon="library-outline"
            title="Reading & translation hub"
            subtitle="Shortcuts into reading, narration, and offline cache"
            href="/settings/quran"
          />
          <ChevRow icon="archive-outline" title="Offline reading" subtitle="Cached surahs on-device" href="/settings/offline" last />
        </Section>

        <Section title="Reflection">
          <ChevRow
            icon="chatbubble-ellipses-outline"
            title="Chat history"
            subtitle="AI threads beside your reflections"
            href="/(tabs)/reflect"
          />
          <ChevRow
            icon="reader-outline"
            title="Reflection history"
            subtitle="Saved reflections from Reflect"
            href="/(tabs)/reflect"
          />
          <ChevRow icon="folder-outline" title="Folders" subtitle="Organise your library" href="/settings/folders" />
          <ChevRow icon="mic-outline" title="Recordings" subtitle="Khutbah & on-device audio" href="/settings/recordings" last />
        </Section>

        <Section title="Support">
          <ChevRow icon="information-circle-outline" title="About" href="/settings/about" />
          <ChevRow icon="mail-outline" title="Feedback" href="/settings/feedback" />
          <ChevRow icon="paper-plane-outline" title="Invite a friend" href="/settings/invite" />
          <ChevRow icon="help-circle-outline" title="FAQ" href="/settings/faq" />
          <ChevRow icon="shield-outline" title="Privacy" href="/settings/privacy" />
          <ChevRow icon="document-text-outline" title="Terms" href="/settings/terms" last />
        </Section>

        <Pressable style={styles.footerLink} onPress={() => void replayOnboarding()}>
          <Text style={styles.footerLinkTxt}>Replay onboarding</Text>
        </Pressable>
        {__DEV__ ? (
          <Pressable style={styles.footerLink} onPress={() => router.push("/internal/navigation-audit")}>
            <Text style={[styles.footerLinkTxt, { opacity: 0.8 }]}>Internal navigation audit</Text>
          </Pressable>
        ) : null}
        {__DEV__ ? (
          <Pressable style={styles.footerLink} onPress={() => router.push("/internal/qa")}>
            <Text style={[styles.footerLinkTxt, { opacity: 0.8 }]}>Internal QA checklist</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Modal
        visible={deleteOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deletingAccount) {
            setDeleteOpen(false);
            setDeleteTyping("");
          }
        }}
      >
        <View style={styles.deleteModalScrim}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Delete your account?</Text>
            <Text style={styles.deleteModalBody}>
              This removes your DeenNotes profile, saved share cards, onboarding profile, and synced reflections from
              our servers. Local data on this phone is cleared. This cannot be undone.
            </Text>
            <Text style={styles.deleteModalBodySmall}>
              Active Apple subscriptions remain with Apple until you cancel in Settings → Apple ID → Subscriptions.
            </Text>
            <Text style={styles.deleteTypeK}>Type DELETE to confirm</Text>
            <TextInput
              style={styles.deleteInput}
              placeholder="DELETE"
              placeholderTextColor={muted}
              autoCapitalize="characters"
              autoCorrect={false}
              value={deleteTyping}
              editable={!deletingAccount}
              onChangeText={setDeleteTyping}
              accessibilityLabel="Type DELETE to confirm account deletion"
            />
            <View style={styles.deleteModalRow}>
              <Pressable
                style={[styles.deleteCancelBtn, deletingAccount && styles.deleteBtnDisabled]}
                onPress={() => {
                  if (!deletingAccount) {
                    setDeleteOpen(false);
                    setDeleteTyping("");
                  }
                }}
                accessibilityRole="button"
              >
                <Text style={styles.deleteCancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.deleteDangerBtn,
                  (deletingAccount || deleteTyping.trim() !== DELETE_CONFIRM_PHRASE) &&
                    styles.deleteBtnDisabled,
                ]}
                onPress={() => void runAccountDeletion()}
                disabled={deletingAccount || deleteTyping.trim() !== DELETE_CONFIRM_PHRASE}
                accessibilityRole="button"
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteDangerTxt}>Delete permanently</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    margin: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.35)",
    backgroundColor: "rgba(184,134,11,0.06)",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  plusCardBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  plusCardBrandText: {
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
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

  deleteHint: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: border,
  },
  deleteHintTxt: { fontWeight: "800", fontSize: fontSizes.sm, color: "#b45309" },
  deleteHintSub: { fontSize: fontSizes.xs, color: muted, lineHeight: 18, marginTop: 4 },

  deleteModalScrim: {
    flex: 1,
    backgroundColor: "rgba(28,25,23,0.45)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  deleteModalCard: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: border,
  },
  deleteModalTitle: { fontFamily: fontSerifHeading, fontSize: fontSizes.xl, fontWeight: "600", color: ink },
  deleteModalBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  deleteModalBodySmall: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  deleteTypeK: { fontSize: fontSizes.xs, fontWeight: "800", color: ink, marginTop: spacing.sm },
  deleteInput: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    color: ink,
    fontWeight: "700",
    backgroundColor: stone,
    marginTop: spacing.xs,
  },
  deleteModalRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  deleteCancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
  },
  deleteCancelTxt: { fontWeight: "800", color: ink, fontSize: fontSizes.sm },
  deleteDangerBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: "#b91c1c",
  },
  deleteDangerTxt: { fontWeight: "800", color: "#fff", fontSize: fontSizes.sm },
  deleteBtnDisabled: { opacity: 0.45 },

  footerLink: { alignSelf: "center", paddingVertical: spacing.lg },
  footerLinkTxt: { fontWeight: "800", color: emerald, fontSize: fontSizes.sm },
});
