import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { usePrayerToday } from "../../src/api/hooks/usePrayerToday";
import type { PrayerName } from "../../src/api/types";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { CalmPulseBlock } from "../../src/components/skeleton/CalmSkeleton";
import {
  REFLECTION_PROMPT,
  REFLECTION_PROMPT_LEARNING,
  REFLECTION_SLOT,
  SALAH_SLOT_ORDER,
  SLOT_DISPLAY,
  type SalahPlannerDay,
  type SalahSlotId,
} from "../../src/contracts/salah-planner";
import { readLearningMode } from "../../src/lib/learning-mode-storage";
import {
  addSalahPlannerTask,
  readSalahPlannerDay,
  removeSalahPlannerTask,
  toggleSalahPlannerTask,
  updateSalahPlannerReflection,
} from "../../src/lib/salah-planner-storage";
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

const SLOT_TO_TIMING: Record<SalahSlotId, PrayerName> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export default function SalahPlannerScreen() {
  return (
    <ScreenErrorBoundary scope="salah-planner">
      <SalahPlannerInner />
    </ScreenErrorBoundary>
  );
}

function SalahPlannerInner() {
  const insets = useSafeAreaInsets();
  const { data: prayerData, isLoading: prayerLoading } = usePrayerToday();
  const [day, setDay] = useState<SalahPlannerDay | null>(null);
  const [learningMode, setLearningMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<SalahSlotId, string>>({
    fajr: "",
    dhuhr: "",
    asr: "",
    maghrib: "",
    isha: "",
  });

  const reload = useCallback(async () => {
    const [planner, lm] = await Promise.all([readSalahPlannerDay(), readLearningMode()]);
    setDay(planner);
    setLearningMode(lm.enabled);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const prayerPayload =
    prayerData && "ok" in prayerData && prayerData.ok ? prayerData : null;
  const timings = prayerPayload?.timings ?? null;
  const nextPrayer = prayerPayload?.schedule.nextPrayer ?? null;
  const currentPrayer = prayerPayload?.schedule.currentPrayer ?? null;

  async function onAddTask(slot: SalahSlotId) {
    const text = drafts[slot];
    if (!text.trim()) return;
    const next = await addSalahPlannerTask(slot, text);
    setDay(next);
    setDrafts((d) => ({ ...d, [slot]: "" }));
  }

  async function onToggle(slot: SalahSlotId, taskId: string) {
    const next = await toggleSalahPlannerTask(slot, taskId);
    setDay(next);
  }

  async function onRemove(slot: SalahSlotId, taskId: string) {
    const next = await removeSalahPlannerTask(slot, taskId);
    setDay(next);
  }

  function onReflectionDraft(text: string) {
    setDay((d) => (d ? { ...d, reflection: text } : d));
  }

  async function persistReflection() {
    if (!day) return;
    await updateSalahPlannerReflection(day.reflection);
  }

  const reflectionPrompt = learningMode ? REFLECTION_PROMPT_LEARNING : REFLECTION_PROMPT;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 28) + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lead}>
            {learningMode
              ? "Shape your day around the five daily prayers — one small step at a time."
              : "Organise today's intentions around the five daily prayers."}
          </Text>

          {prayerLoading ? (
            <View style={styles.loadingBox} accessibilityRole="progressbar">
              <CalmPulseBlock height={72} />
              <Text style={styles.loadingHint}>Loading prayer windows…</Text>
            </View>
          ) : null}

          {!prayerLoading && !prayerPayload ? (
            <View style={styles.banner}>
              <Text style={styles.bannerTxt}>
                Prayer times are offline — you can still plan tasks. Times appear when connected.
              </Text>
            </View>
          ) : null}

          {!day ? (
            <Text style={styles.loadingHint}>Gathering today&apos;s plan…</Text>
          ) : (
            SALAH_SLOT_ORDER.map((slot) => {
              const timingName = SLOT_TO_TIMING[slot];
              const timeLabel = timings?.[timingName] ?? "—";
              const active =
                timingName === nextPrayer || timingName === currentPrayer;
              const tasks = day.slots[slot];
              const showReflection = slot === REFLECTION_SLOT;

              return (
                <View
                  key={slot}
                  style={[styles.slotCard, active && styles.slotCardActive]}
                >
                  <View style={styles.slotHeader}>
                    <Text style={styles.slotName}>{SLOT_DISPLAY[slot]}</Text>
                    <Text style={styles.slotTime}>{timeLabel}</Text>
                  </View>

                  {tasks.map((task) => (
                    <View key={task.id} style={styles.taskRow}>
                      <Pressable
                        onPress={() => void onToggle(slot, task.id)}
                        style={styles.checkBtn}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: task.done }}
                        accessibilityLabel={task.text}
                      >
                        <Ionicons
                          name={task.done ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={task.done ? emerald : muted}
                        />
                      </Pressable>
                      <Text
                        style={[styles.taskText, task.done && styles.taskTextDone]}
                        numberOfLines={3}
                      >
                        {task.text}
                      </Text>
                      <Pressable
                        onPress={() => void onRemove(slot, task.id)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${task.text}`}
                      >
                        <Ionicons name="close" size={20} color={muted} />
                      </Pressable>
                    </View>
                  ))}

                  <View style={styles.addRow}>
                    <TextInput
                      style={styles.addInput}
                      value={drafts[slot]}
                      onChangeText={(v) => setDrafts((d) => ({ ...d, [slot]: v }))}
                      placeholder={
                        learningMode ? "A small step for this window…" : "Add a task…"
                      }
                      placeholderTextColor={muted}
                      returnKeyType="done"
                      onSubmitEditing={() => void onAddTask(slot)}
                    />
                    <Pressable
                      style={styles.addBtn}
                      onPress={() => void onAddTask(slot)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add task for ${SLOT_DISPLAY[slot]}`}
                    >
                      <Ionicons name="add" size={22} color="#fff" />
                    </Pressable>
                  </View>

                  {showReflection ? (
                    <View style={styles.reflectionBlock}>
                      <Text style={styles.reflectionKicker}>Reflection</Text>
                      <Text style={styles.reflectionPrompt}>{reflectionPrompt}</Text>
                      <TextInput
                        style={styles.reflectionInput}
                        value={day.reflection}
                        onChangeText={onReflectionDraft}
                        onBlur={() => void persistReflection()}
                        placeholder={
                          learningMode
                            ? "A thought to return to…"
                            : "Write what you want to return to…"
                        }
                        placeholderTextColor={muted}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>
                  ) : null}
                </View>
              );
            })
          )}

          <View style={styles.footerNote}>
            <Text style={styles.footerTitle}>First step toward a salah-centered day</Text>
            <Text style={styles.footerBody}>
              This planner stays on your device for now. Future modules — habits, sleep, fitness —
              can anchor here without changing how you pray.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingTop: spacing.sm },
  lead: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  loadingBox: { gap: spacing.sm, paddingVertical: spacing.md },
  loadingHint: { fontSize: fontSizes.sm, color: muted, textAlign: "center" },
  banner: {
    backgroundColor: "rgba(184,134,11,0.1)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.3)",
    padding: spacing.md,
  },
  bannerTxt: { fontSize: fontSizes.sm, color: ink, lineHeight: 20 },
  slotCard: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  slotCardActive: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.04)",
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  slotName: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    color: ink,
    fontWeight: "600",
  },
  slotTime: {
    fontSize: fontSizes.md,
    color: bronze,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 4,
  },
  checkBtn: { padding: 2 },
  taskText: { flex: 1, fontSize: fontSizes.md, color: ink, lineHeight: 22 },
  taskTextDone: { color: muted, textDecorationLine: "line-through" },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: stone,
    minHeight: 44,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: emerald,
    alignItems: "center",
    justifyContent: "center",
  },
  reflectionBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: border,
    gap: spacing.sm,
  },
  reflectionKicker: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reflectionPrompt: {
    fontSize: fontSizes.md,
    color: ink,
    lineHeight: 24,
    fontStyle: "italic",
  },
  reflectionInput: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: ink,
    backgroundColor: stone,
    minHeight: 88,
    lineHeight: 22,
  },
  footerNote: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: "rgba(18,122,99,0.05)",
    gap: spacing.xs,
  },
  footerTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.md,
    color: ink,
  },
  footerBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
});
