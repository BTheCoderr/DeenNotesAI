import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export type QaStatus = "unset" | "pass" | "fail";

export type QaStepPersist = {
  status: QaStatus;
  notes: string;
  updatedAt: string | null;
};

export type QaStoreV1 = { v: 1; rows: Record<string, QaStepPersist> };

const STORAGE_KEY = "deennotes.internal.m9.subscription.qa.v1";

export const SUBSCRIPTION_QA_SECTIONS: { id: string; title: string; steps: readonly string[] }[] = [
  {
    id: "purchase",
    title: "Purchases",
    steps: [
      "Sandbox purchase on annual card completes; UI returns to app with Plus active.",
      "Declined payment surfaces calm error string (not a dead end).",
      "User-cancelled purchase does not nag after closing sheet.",
    ],
  },
  {
    id: "restore",
    title: "Restore",
    steps: [
      "Restore with prior subscription re-entitles without requiring re-purchase.",
      "Restore with no receipt shows honest copy; app remains usable complimentary.",
    ],
  },
  {
    id: "trial",
    title: "Trial & expiry",
    steps: [
      "Starting a trial emits expected RevenueCat entitlement (periodType TRIAL/INTRO in dashboard).",
      "After expiry, premium gates behave without flashes of unlocked UI on cold launch.",
      "Paywall reopen after expiry feels emotionally aligned — not punitive.",
    ],
  },
  {
    id: "cache",
    title: "Cache & persistence",
    steps: [
      "Airplane mode + relaunch honours last known entitlement briefly (offline cache).",
      "Forground refresh restores true state when radios return.",
      "Logout clears premium UI for signed-in testers; unrelated anon cache preserved.",
    ],
  },
  {
    id: "paywall_timing",
    title: "Paywall timing",
    steps: [
      "After onboarding deferral (~2–3s): paywall arrives without blocking first Today paint.",
      "After first reflective generation: softer prompt waits ~2s after success.",
      "Gate taps explain themselves; yearly card stays visually strongest.",
    ],
  },
  {
    id: "compliance",
    title: "App Store cues",
    steps: ["Restore purchases button visible.", "Terms + Privacy links reachable from modal footer."],
  },
];

function stepKey(sectionId: string, index: number): string {
  return `${sectionId}::${index}`;
}

async function loadStore(): Promise<QaStoreV1> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { v: 1, rows: {} };
  try {
    const parsed = JSON.parse(raw) as QaStoreV1;
    if (parsed?.v !== 1 || typeof parsed.rows !== "object") return { v: 1, rows: {} };
    return parsed;
  } catch {
    return { v: 1, rows: {} };
  }
}

async function persistRows(rows: Record<string, QaStepPersist>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, rows }));
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

export default function InternalQaScreen() {
  const [store, setStore] = useState<QaStoreV1>({ v: 1, rows: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadStore().then((s) => {
      if (!alive) return;
      setStore(s);
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const updateRow = useCallback((key: string, patch: Partial<QaStepPersist>) => {
    setStore((prev) => {
      const prevRow = prev.rows[key] ?? { status: "unset" as QaStatus, notes: "", updatedAt: null };
      const merged: QaStepPersist = {
        status: patch.status ?? prevRow.status,
        notes: patch.notes !== undefined ? patch.notes : prevRow.notes,
        updatedAt:
          patch.updatedAt ??
          (patch.status !== undefined || patch.notes !== undefined ? new Date().toISOString() : prevRow.updatedAt),
      };
      const rows = { ...prev.rows, [key]: merged };
      void persistRows(rows);
      return { v: 1, rows };
    });
  }, []);

  const clearAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setStore({ v: 1, rows: {} });
  }, []);

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={["bottom", "left", "right"]}>
        <Text style={styles.hint}>Unfolding your QA sheet…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1} accessibilityRole="header">
          M9 Subscription QA checklist
        </Text>
        <Text style={styles.lead}>
          RevenueCat subscriptions, restores, caches, paywall softness — checkpoints stay on-device in __DEV__
          builds only.
        </Text>

        <Pressable style={styles.clearBtn} onPress={() => void clearAll()} accessibilityLabel="Clear all QA checkpoints">
          <Text style={styles.clearBtnTxt}>Clear all checkpoints</Text>
        </Pressable>

        {SUBSCRIPTION_QA_SECTIONS.map((sec) => (
          <View key={sec.id} style={styles.card}>
            <Text style={styles.secTitle}>{sec.title}</Text>
            {sec.steps.map((txt, idx) => {
              const sk = stepKey(sec.id, idx);
              const row = store.rows[sk] ?? { status: "unset" as QaStatus, notes: "", updatedAt: null };
              return (
                <View key={sk} style={styles.stepWrap}>
                  <Text style={styles.stepTxt}>{txt}</Text>
                  <Text style={styles.time}>Updated {fmtTime(row.updatedAt)}</Text>

                  <View style={styles.toggles}>
                    <Pressable
                      style={[styles.tf, row.status === "pass" && styles.tfOn]}
                      onPress={() => updateRow(sk, { status: row.status === "pass" ? "unset" : "pass" })}
                      accessibilityRole="button"
                      accessibilityLabel={`Pass checklist item ${idx + 1}`}
                      accessibilityHint={txt.slice(0, 200)}
                    >
                      <Text style={[styles.tfTxt, row.status === "pass" && styles.tfTxtOn]}>Pass</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.tf, row.status === "fail" && styles.tfFailOn]}
                      onPress={() => updateRow(sk, { status: row.status === "fail" ? "unset" : "fail" })}
                      accessibilityRole="button"
                      accessibilityLabel={`Fail checklist item ${idx + 1}`}
                      accessibilityHint={txt.slice(0, 200)}
                    >
                      <Text style={[styles.tfTxt, row.status === "fail" && styles.tfTxtFail]}>Fail</Text>
                    </Pressable>
                  </View>

                  <TextInput
                    style={styles.notes}
                    placeholder="Quiet notes…"
                    placeholderTextColor={muted}
                    value={row.notes}
                    onChangeText={(t) => updateRow(sk, { notes: t })}
                    multiline
                    accessibilityLabel={`Notes for checklist item ${idx + 1} in ${sec.title}`}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { padding: spacing.xl, paddingBottom: 120, gap: spacing.md },
  center: { justifyContent: "center", alignItems: "center", padding: spacing.xl },
  hint: { color: muted, fontSize: fontSizes.md },

  h1: { fontFamily: fontSerifHeading, fontSize: 26, fontWeight: "600", color: ink },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },

  clearBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: minTouchTarget,
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
  },
  clearBtnTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.sm },

  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    padding: spacing.md,
    gap: spacing.lg,
  },
  secTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepWrap: { gap: spacing.sm },
  stepTxt: { fontSize: fontSizes.md, color: ink, lineHeight: 22 },
  time: { fontSize: fontSizes.xs, color: muted },

  toggles: { flexDirection: "row", gap: spacing.sm },
  tf: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: minTouchTarget,
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
  },
  tfOn: { borderColor: emerald, backgroundColor: "rgba(18,122,99,0.1)" },
  tfFailOn: { borderColor: "#b45309", backgroundColor: "rgba(180,83,9,0.08)" },
  tfTxt: { fontWeight: "800", fontSize: fontSizes.sm, color: ink },
  tfTxtOn: { color: emerald },
  tfTxtFail: { color: "#b45309" },

  notes: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    padding: spacing.sm,
    minHeight: 72,
    fontSize: fontSizes.sm,
    color: ink,
    textAlignVertical: "top",
    backgroundColor: stone,
  },
});
