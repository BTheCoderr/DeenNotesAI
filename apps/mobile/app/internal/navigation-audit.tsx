import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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

type RouteKind = "tabs" | "nested-stack" | "root-stack" | "modal" | "redirect";

type EscapeKind = "bottom_tabs" | "header_back" | "header_close_chevron" | "header_close_text" | "replace_or_in_screen";

export type AuditRowDef = {
  route: string;
  kind: RouteKind;
  shouldShowTabs: boolean;
  shouldHaveBackOrClose: boolean;
  escape: EscapeKind;
  fallbackOrNote: string;
  href?: Href;
};

/** Manual regression + deep-link smoke checklist (__DEV__ only route). */
export const NAVIGATION_AUDIT_ROWS: readonly AuditRowDef[] = [
  {
    route: "(tabs)/index · Today",
    kind: "tabs",
    shouldShowTabs: true,
    shouldHaveBackOrClose: false,
    escape: "bottom_tabs",
    fallbackOrNote: "Tabs always visible",
    href: "/",
  },
  {
    route: "(tabs)/reflect",
    kind: "tabs",
    shouldShowTabs: true,
    shouldHaveBackOrClose: false,
    escape: "bottom_tabs",
    fallbackOrNote: "Gear opens Settings stack",
    href: "/reflect",
  },
  {
    route: "(tabs)/new",
    kind: "redirect",
    shouldShowTabs: false,
    shouldHaveBackOrClose: false,
    escape: "replace_or_in_screen",
    fallbackOrNote: "Redirects to /new-sheet",
    href: "/new",
  },
  {
    route: "(tabs)/quran",
    kind: "tabs",
    shouldShowTabs: true,
    shouldHaveBackOrClose: false,
    escape: "bottom_tabs",
    fallbackOrNote: "Reader nested under /quran stack",
    href: "/quran",
  },
  {
    route: "(tabs)/prayer",
    kind: "tabs",
    shouldShowTabs: true,
    shouldHaveBackOrClose: false,
    escape: "bottom_tabs",
    fallbackOrNote: "Gear opens Settings stack",
    href: "/prayer",
  },
  {
    route: "settings/index",
    kind: "nested-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: deep("/(tabs)"),
    href: "/settings",
  },
  {
    route: "settings subpages (prayer, location, hijri, quran, …)",
    kind: "nested-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: deep("/settings"),
    href: "/settings/prayer",
  },
  {
    route: "quran/settings",
    kind: "nested-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: deep("/(tabs)/quran"),
    href: "/quran/settings",
  },
  {
    route: "quran/[surah]",
    kind: "nested-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: `${deep("/(tabs)/quran")} · immersive mode uses in-screen back`,
    href: "/quran/1",
  },
  {
    route: "new-sheet",
    kind: "modal",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_close_text",
    fallbackOrNote: deep("/(tabs)"),
    href: "/new-sheet",
  },
  {
    route: "compose/[mode]",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_close_chevron",
    fallbackOrNote: deep("/new-sheet"),
    href: "/compose/paste_notes",
  },
  {
    route: "recording/session",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: deep("/new-sheet"),
    href: "/recording/session",
  },
  {
    route: "recordings/index",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: deep("/(tabs)/reflect"),
    href: "/recordings",
  },
  {
    route: "recordings/[id]",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: `${deep("/recordings")} · placeholder id may show missing state`,
    href: "/recordings/nav-audit-placeholder",
  },
  {
    route: "notes/[id]",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: `${deep("/(tabs)/reflect")} · placeholder id may show empty/error`,
    href: "/notes/nav-audit-placeholder",
  },
  {
    route: "login",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: `${deep("/(tabs)")} · “Not now” also uses safeBack`,
    href: "/login",
  },
  {
    route: "onboarding",
    kind: "root-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "replace_or_in_screen",
    fallbackOrNote: "No native header · step 0 Back → router.replace(\"/(tabs)\")",
    href: "/onboarding",
  },
  {
    route: "internal/qa",
    kind: "nested-stack",
    shouldShowTabs: false,
    shouldHaveBackOrClose: true,
    escape: "header_back",
    fallbackOrNote: deep("/(tabs)"),
    href: "/internal/qa",
  },
] as const;

function deep(target: string): string {
  return `No history → safeBack replace → ${target}`;
}

function AuditRow({ row, onOpen }: { row: AuditRowDef; onOpen?: () => void }) {
  const inner = (
    <View style={styles.card}>
      <Text style={styles.route}>{row.route}</Text>
      <Text style={styles.meta}>
        kind: {row.kind} · tabs: {row.shouldShowTabs ? "yes" : "no"} · back/close:{" "}
        {row.shouldHaveBackOrClose ? "yes" : "n/a"}
      </Text>
      <Text style={styles.escape}>Escape: {row.escape}</Text>
      <Text style={styles.fallback}>{row.fallbackOrNote}</Text>
      {row.href ? <Text style={styles.tapHint}>Tap to open →</Text> : null}
    </View>
  );

  if (onOpen) {
    return (
      <Pressable
        onPress={onOpen}
        style={styles.rowPress}
        accessibilityRole="button"
        accessibilityLabel={`Open route ${row.route}`}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.rowPress}>{inner}</View>;
}

export default function NavigationAuditScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Navigation audit route list">
      <Text style={styles.k}>Internal · M7B</Text>
      <Text style={styles.h1}>Navigation escape audit</Text>
      <Text style={styles.lead}>
        Each row opens a route so you can verify tabs, native back/close, or safe fallback after a cold deep link.
      </Text>

      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        <Pressable style={styles.jump} onPress={() => router.push("/internal/qa")} accessibilityRole="button">
          <Text style={styles.jumpTxt}>Jump to M7 QA checklist</Text>
        </Pressable>
        <Pressable
          style={styles.jump}
          onPress={() => router.push("/internal/subscription-qa")}
          accessibilityRole="button"
        >
          <Text style={styles.jumpTxt}>Jump to M9 Subscription QA</Text>
        </Pressable>
      </View>

      {NAVIGATION_AUDIT_ROWS.map((row) => (
        <AuditRow key={row.route} row={row} onOpen={row.href ? () => router.push(row.href!) : undefined} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.xl,
    paddingBottom: 48,
    gap: spacing.md,
    backgroundColor: stone,
  },
  k: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xxl,
    fontWeight: "600",
    color: ink,
  },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  jump: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    minHeight: 44,
    justifyContent: "center",
  },
  jumpTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.sm },
  rowPress: {},
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  route: { fontSize: fontSizes.md, fontWeight: "800", color: ink },
  meta: { fontSize: fontSizes.xs, color: muted },
  escape: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
  fallback: { fontSize: fontSizes.sm, color: ink, lineHeight: 20 },
  tapHint: { fontSize: fontSizes.xs, color: bronze, marginTop: spacing.xs },
});
