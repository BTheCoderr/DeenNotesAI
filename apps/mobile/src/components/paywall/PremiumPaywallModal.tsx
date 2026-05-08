import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PurchasesPackage } from "react-native-purchases";
import Purchases, { PACKAGE_TYPE } from "react-native-purchases";

import {
  PRODUCT_MONTHLY_DEENNOTES,
  PRODUCT_YEARLY_DEENNOTES,
  type PremiumGateReason,
} from "../../contracts/premium";
import { DeenNotesAppIconMark } from "../brand/DeenNotesAppIconMark";
import {
  COPY_PURCHASE_INCOMPLETE,
  COPY_RESTORE_INCOMPLETE,
  COPY_SUBSCRIPTIONS_CATALOG_RETRY,
  COPY_SUBSCRIPTIONS_UNAVAILABLE,
} from "../../contracts/review-user-copy";
import {
  logProductEvent,
  logTrialSignalsFromCustomerInfo,
} from "../../lib/analytics/mobile-product-events";
import { getLegalPrivacyUrl, getLegalTermsUrl } from "../../lib/purchases/expo-extra";
import {
  premiumActiveFromCustomerInfo,
  purchasePackage,
  restorePurchasesNative,
  configureRevenueCatBootstrap,
  isPurchasesConfigured,
  isRevenueCatAvailable,
} from "../../lib/purchases/revenuecat-bootstrap";
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
} from "../../theme";

export type PaywallOutcome = "user_closed" | "purchase_completed" | "restore_completed";

export type PremiumPaywallModalProps = {
  visible: boolean;
  reason: PremiumGateReason | null;
  onOutcome: (kind: PaywallOutcome) => void;
  onPurchaseSuccess?: () => void | Promise<void>;
};

const LOCK_FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: "infinite-outline",
    title: "Deeper reflection space",
    body: "More room for heart-work on the contemplative path you have already begun — without tight caps.",
  },
  {
    icon: "musical-notes-outline",
    title: "Khutbah you can revisit",
    body: "Preserve local captures and craft calmly from recordings when you worship in community.",
  },
  {
    icon: "download-outline",
    title: "Uninterrupted listening",
    body: "Immersive Quran audio that stays nearer on-device when travel or quiet cabins ask for steadiness.",
  },
  {
    icon: "notifications-outline",
    title: "Gentler rhythm cues",
    body: "Lead-times and speciality nudges that mirror your salah without crowding attention.",
  },
  {
    icon: "moon-outline",
    title: "Seasonal devotional clarity",
    body: "Ramadan-focused surfaces that respect where you are in the lunar month.",
  },
  {
    icon: "cloud-done-outline",
    title: "Reflections preserved in one place",
    body: "Your signed-in reflections stay mirrored with care across revisits.",
  },
];

function ReasonLine({ reason }: { reason: PremiumGateReason | null }) {
  if (!reason || reason === "general") return null;
  const copy: Partial<Record<PremiumGateReason, string>> = {
    compose_ai_quota:
      "You reached the tranquil limit we can offer without membership — Plus keeps your rhythm uninterrupted.",
    khutbah_recording:
      "Local khutbah capture is stewarded thoughtfully for subscribed listeners who want continuity after jumuʼah.",
    offline_quran_audio:
      "On-device Quran audio pacing is nurtured for uninterrupted listening journeys.",
    advanced_prayer_reminders:
      "Fine-tuned lead-times and speciality reminders honour your spiritual rhythm alongside daily salah.",
    ramadan_planning:
      "Month-aware devotional surfaces remain gently tuned for DeenNotes Plus.",
    reflect_cloud_sync: "Preserve your reflections in one serene library mirrored with your signed-in visits.",
    after_onboarding:
      "Whenever you wish to deepen your rhythm, memberships help us keep craft sustainable and unrushed.",
    after_first_generation:
      "If that reflection eased your heart, DeenNotes Plus helps us continue nourishing this space.",
  };
  const line = copy[reason];
  if (!line) return null;
  return <Text style={styles.reason}>{line}</Text>;
}

function settleUserClose(reason: PremiumGateReason | null, finalize: (o: PaywallOutcome) => void) {
  logProductEvent("paywall_dismissed", reason ? { reason } : {});
  finalize("user_closed");
}

/** Full-screen upgrade surface tuned for App Review and emotional clarity. */
export function PremiumPaywallModal({
  visible,
  reason,
  onOutcome,
  onPurchaseSuccess,
}: PremiumPaywallModalProps) {
  const [busy, setBusy] = useState<"purchase-year" | "purchase-month" | "restore" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [catalogState, setCatalogState] = useState<
    "idle" | "loading" | "no_iap" | "sdk_unready" | "offerings_error" | "offerings_empty" | "ready"
  >("idle");
  const [offeringsBusy, setOfferingsBusy] = useState(false);

  function finalize(kind: PaywallOutcome) {
    onOutcome(kind);
  }

  const reloadOfferings = useCallback(async () => {
    setErr(null);
    setOfferingsBusy(true);
    setCatalogState("loading");
    setAnnualPkg(null);
    setMonthlyPkg(null);

    if (!isRevenueCatAvailable()) {
      setCatalogState("no_iap");
      setOfferingsBusy(false);
      return;
    }

    await configureRevenueCatBootstrap();
    if (!isPurchasesConfigured()) {
      setCatalogState("sdk_unready");
      setOfferingsBusy(false);
      return;
    }

    try {
      const offers = await Purchases.getOfferings();
      const current = offers.current;
      const pkgs = current?.availablePackages ?? [];

      const annual =
        current?.annual ??
        pkgs.find((p) => (p.product?.identifier ?? "") === PRODUCT_YEARLY_DEENNOTES) ??
        pkgs.find((p) => p.identifier === PRODUCT_YEARLY_DEENNOTES) ??
        pkgs.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL) ??
        null;

      const monthly =
        current?.monthly ??
        pkgs.find((p) => (p.product?.identifier ?? "") === PRODUCT_MONTHLY_DEENNOTES) ??
        pkgs.find((p) => p.identifier === PRODUCT_MONTHLY_DEENNOTES) ??
        pkgs.find((p) => p.packageType === PACKAGE_TYPE.MONTHLY) ??
        null;

      setAnnualPkg(annual);
      setMonthlyPkg(monthly);
      if (!annual && !monthly) {
        setCatalogState("offerings_empty");
      } else {
        setCatalogState("ready");
      }
    } catch {
      setCatalogState("offerings_error");
    } finally {
      setOfferingsBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      setCatalogState("idle");
      return;
    }
    void reloadOfferings();
  }, [visible, reloadOfferings]);

  async function onBuyAnnual(e: GestureResponderEvent) {
    e.stopPropagation();
    if (!annualPkg) return;
    setBusy("purchase-year");
    setErr(null);
    logProductEvent("purchase_attempt", { plan: "annual" });
    try {
      const info = await purchasePackage(annualPkg);
      logProductEvent("purchase_success", { plan: "annual", active: premiumActiveFromCustomerInfo(info) });
      logTrialSignalsFromCustomerInfo(info, annualPkg.product.identifier);
      await onPurchaseSuccess?.();
      finalize("purchase_completed");
    } catch (e: unknown) {
      const u = e as { userCancelled?: boolean };
      if (u?.userCancelled) logProductEvent("purchase_failed", { plan: "annual", cancelled: true });
      else {
        logProductEvent("purchase_failed", { plan: "annual", cancelled: false });
        setErr(COPY_PURCHASE_INCOMPLETE);
      }
    } finally {
      setBusy(null);
    }
  }

  async function onBuyMonthly(e: GestureResponderEvent) {
    e.stopPropagation();
    if (!monthlyPkg) return;
    setBusy("purchase-month");
    setErr(null);
    logProductEvent("purchase_attempt", { plan: "monthly" });
    try {
      const info = await purchasePackage(monthlyPkg);
      logProductEvent("purchase_success", { plan: "monthly", active: premiumActiveFromCustomerInfo(info) });
      logTrialSignalsFromCustomerInfo(info, monthlyPkg.product.identifier);
      await onPurchaseSuccess?.();
      finalize("purchase_completed");
    } catch (e: unknown) {
      const u = e as { userCancelled?: boolean };
      if (u?.userCancelled) logProductEvent("purchase_failed", { plan: "monthly", cancelled: true });
      else {
        logProductEvent("purchase_failed", { plan: "monthly", cancelled: false });
        setErr(COPY_PURCHASE_INCOMPLETE);
      }
    } finally {
      setBusy(null);
    }
  }

  async function onRestore() {
    setBusy("restore");
    setErr(null);
    logProductEvent("restore_attempt", {});
    try {
      const info = await restorePurchasesNative();
      if (!info) {
        setErr(COPY_SUBSCRIPTIONS_UNAVAILABLE);
        return;
      }
      logProductEvent("restore_success", { entitled: premiumActiveFromCustomerInfo(info) });
      logTrialSignalsFromCustomerInfo(info, null);
      await onPurchaseSuccess?.();
      finalize("restore_completed");
    } catch {
      logProductEvent("restore_failed", {});
      setErr(COPY_RESTORE_INCOMPLETE);
    } finally {
      setBusy(null);
    }
  }

  const closeUser = () => settleUserClose(reason, finalize);

  return (
    <Modal animationType="slide" visible={visible} presentationStyle="pageSheet" onRequestClose={closeUser}>
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <View style={styles.header}>
        <View style={styles.headerBrand}>
          <DeenNotesAppIconMark size={44} />
          <Text style={styles.brandEyebrow}>DeenNotes Plus</Text>
        </View>
        <Pressable onPress={closeUser} hitSlop={12} accessibilityRole="button" accessibilityLabel="Dismiss">
            <Ionicons name="close-circle" size={minTouchTarget} color={muted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Sustain your calm rhythm</Text>
          <ReasonLine reason={reason} />
          <Text style={styles.lead}>
            Memberships honour Apple&apos;s renewal rules. Trials or introductory offers that App Store Connect
            attaches may appear only at checkout — Apple controls eligibility and wording.
          </Text>

          {catalogState !== "ready" ? (
            <View
              style={[
                styles.offerCard,
                { borderStyle: "dashed", flexDirection: "column", gap: spacing.sm, alignItems: "stretch" },
              ]}
            >
              {(offeringsBusy || catalogState === "loading") && !err ? (
                <ActivityIndicator color={emerald} style={{ alignSelf: "center" }} />
              ) : null}
              <Text style={[styles.offerErr, { textAlign: "center" }]}>
                {catalogState === "no_iap"
                  ? COPY_SUBSCRIPTIONS_UNAVAILABLE
                  : catalogState === "sdk_unready" ||
                      catalogState === "offerings_error" ||
                      catalogState === "offerings_empty"
                    ? COPY_SUBSCRIPTIONS_CATALOG_RETRY
                    : "Gathering stewardship plans…"}
              </Text>
              {catalogState !== "loading" && catalogState !== "idle" && catalogState !== "no_iap" ? (
                <Pressable
                  style={[styles.secondaryBtn, offeringsBusy ? styles.secondaryDisabled : null]}
                  disabled={offeringsBusy}
                  onPress={() => void reloadOfferings()}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading subscriptions"
                >
                  <Text style={styles.secondaryTxt}>{offeringsBusy ? "Reconnecting…" : "Try again"}</Text>
                </Pressable>
              ) : null}
              {catalogState === "no_iap" ? (
                <Pressable onPress={() => void Linking.openURL("https://apps.apple.com/account/subscriptions")}>
                  <Text style={[styles.linkTxt, { textAlign: "center" }]}>Open Apple subscriptions</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <>
              {annualPkg ? (
                <Pressable
                  onPress={(e) => void onBuyAnnual(e)}
                  style={[styles.offerCard, styles.offerPrimary]}
                  disabled={Boolean(busy)}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.chipAnnual}>Annual · thoughtfully highlighted</Text>
                    <Text style={styles.offerTitle}>{annualPkg.product.priceString ?? "Annual plan"}</Text>
                    <Text style={styles.offerSub}>
                      {(annualPkg.product as { description?: string }).description ?? " "}
                    </Text>
                  </View>
                  {busy === "purchase-year" ? <ActivityIndicator color="#fff" /> : null}
                </Pressable>
              ) : null}

              {monthlyPkg ? (
                <Pressable
                  style={styles.offerCard}
                  disabled={Boolean(busy)}
                  onPress={(e) => void onBuyMonthly(e)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerTitleSecondary}>
                      Monthly · {monthlyPkg.product.priceString ?? "Monthly plan"}
                    </Text>
                    <Text style={styles.offerSubSecondary}>
                      The same devotional breadth, paced softly month by month.
                    </Text>
                  </View>
                  {busy === "purchase-month" ? <ActivityIndicator color={emerald} /> : null}
                </Pressable>
              ) : null}
            </>
          )}

          {err ? (
            <Text style={styles.paywallBannerErr} accessibilityRole="alert">
              {err}
            </Text>
          ) : null}

          <View style={styles.legalBox}>
            <Text style={styles.legalHdr}>Subscription disclosures</Text>
            <Text style={styles.legalBody}>
              Payment is charged to your Apple ID account at confirmation. Renewal charges occur within 24 hours
              before the period ends unless auto-renew is turned off beforehand in Settings. Manage subscriptions
              in Apple ID Settings.
            </Text>
            <Text style={styles.legalBody}>
              Free trials and introductory periods convert to paid subscriptions automatically unless canceled at
              least 24 hours before renewal ends, when Apple or your region&apos;s storefront rules apply.
            </Text>
            <Text style={styles.legalBody}>
              To cancel subscriptions purchased through Apple, open{" "}
              <Text style={styles.legalEmph}>Settings → Apple ID → Subscriptions</Text>{" "}
              (or tap “Manage subscriptions” below). Note: unsubscribing here does not delete your DeenNotes account;
              use{" "}
              <Text style={styles.legalEmph}>Settings → Delete account</Text> inside the app if you want profile data
              removed.
            </Text>
          </View>

          <Text style={styles.sectionHdr}>Immersive devotion with Plus</Text>
          {LOCK_FEATURES.map((item) => (
            <View key={item.title} style={styles.lockRow}>
              <Ionicons name={item.icon} size={26} color={emerald} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lockTitle}>{item.title}</Text>
                <Text style={styles.lockBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.secondaryBtn, busy !== null ? styles.secondaryDisabled : {}]}
            onPress={() => void onRestore()}
            disabled={busy !== null}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            {busy === "restore" ? (
              <ActivityIndicator color={emerald} />
            ) : (
              <Text style={styles.secondaryTxt}>Restore purchases</Text>
            )}
          </Pressable>

          <View style={styles.legalLinks}>
            <Pressable onPress={() => void Linking.openURL(getLegalTermsUrl())}>
              <Text style={styles.linkTxt}>Terms of use</Text>
            </Pressable>
            <Text style={styles.linkSep}>•</Text>
            <Pressable onPress={() => void Linking.openURL(getLegalPrivacyUrl())}>
              <Text style={styles.linkTxt}>Privacy policy</Text>
            </Pressable>
            <Text style={styles.linkSep}>•</Text>
            <Pressable onPress={() => void Linking.openURL("https://apps.apple.com/account/subscriptions")}>
              <Text style={styles.linkTxt}>Manage subscriptions</Text>
            </Pressable>
          </View>

          <Pressable onPress={closeUser} accessibilityRole="button" style={styles.continueFree}>
            <Text style={styles.continueFreeTxt}>Stay on the gracious complimentary path</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border,
    backgroundColor: stone,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    paddingRight: spacing.sm,
  },
  brandEyebrow: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    color: emerald,
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.md },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 28,
    fontWeight: "600",
    color: ink,
    marginTop: spacing.sm,
  },
  reason: { fontSize: fontSizes.sm, color: bronze, lineHeight: 22, fontWeight: "600" },
  paywallBannerErr: {
    textAlign: "center",
    fontSize: fontSizes.sm,
    color: ink,
    fontWeight: "600",
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  lead: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 22,
  },
  sectionHdr: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  offerPrimary: {
    backgroundColor: emerald,
    borderColor: emerald,
  },
  chipAnnual: {
    alignSelf: "flex-start",
    fontSize: fontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#e8fcf4",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  offerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
  },
  offerErr: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: ink,
  },
  offerTitle: { fontFamily: fontSerifHeading, fontSize: fontSizes.lg, fontWeight: "600", color: "#fff" },
  offerTitleSecondary: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: ink,
  },
  offerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.9)", lineHeight: 20 },
  offerSubSecondary: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  legalBox: {
    marginTop: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    backgroundColor: "rgba(246,244,240,1)",
    gap: spacing.xs,
  },
  legalHdr: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
  legalBody: { fontSize: fontSizes.xs, color: muted, lineHeight: 18 },
  legalEmph: { fontWeight: "700", color: ink },
  lockRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  lockTitle: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
  lockBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 19 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: border,
    backgroundColor: stone,
    gap: spacing.sm,
  },
  secondaryBtn: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cardBg,
  },
  secondaryDisabled: { opacity: 0.5 },
  secondaryTxt: { color: emerald, fontWeight: "700", fontSize: fontSizes.md },
  legalLinks: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, justifyContent: "center" },
  linkTxt: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
  linkSep: { fontSize: fontSizes.sm, color: muted },
  continueFree: { alignItems: "center", paddingVertical: spacing.sm },
  continueFreeTxt: { fontSize: fontSizes.sm, color: muted, fontWeight: "600" },
});
