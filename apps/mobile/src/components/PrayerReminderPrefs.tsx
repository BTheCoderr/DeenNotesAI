import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import {
  PRAYER_REMINDER_PRAYERS,
  PRAYER_SPECIAL_REMINDERS,
  REMINDER_OFFSETS_MINUTES,
} from "../contracts/prayer-preferences";
import {
  border,
  bronze,
  cardBg,
  emerald,
  fontSizes,
  ink,
  muted,
  radii,
  spacing,
  stone,
} from "../theme";

const STORAGE_KEY = "deennotes.mobile.prayer.reminders.v1";

export type MobileReminderPrefsState = {
  leadMinutes: (typeof REMINDER_OFFSETS_MINUTES)[number];
  prayers: Record<(typeof PRAYER_REMINDER_PRAYERS)[number], boolean>;
  jumuah: boolean;
  suhoor: boolean;
  iftar: boolean;
};

const defaultPrayers = (): MobileReminderPrefsState["prayers"] => ({
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
});

export const DEFAULT_REMINDER_PREFS: MobileReminderPrefsState = {
  leadMinutes: 10,
  prayers: defaultPrayers(),
  jumuah: false,
  suhoor: false,
  iftar: false,
};

function labelPrayer(k: string): string {
  return k.slice(0, 1).toUpperCase() + k.slice(1);
}

function labelSpecial(k: string): string {
  if (k === "jumuah") return "Jumu'ah";
  if (k === "suhoor") return "Suhoor";
  if (k === "iftar") return "Iftar";
  return k;
}

async function loadPrefs(): Promise<MobileReminderPrefsState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_REMINDER_PREFS, prayers: defaultPrayers() };
    const o = JSON.parse(raw) as Partial<MobileReminderPrefsState>;
    const lead = Number(o.leadMinutes);
    const leadMinutes = REMINDER_OFFSETS_MINUTES.includes(
      lead as MobileReminderPrefsState["leadMinutes"],
    )
      ? (lead as MobileReminderPrefsState["leadMinutes"])
      : DEFAULT_REMINDER_PREFS.leadMinutes;
    const prayers = { ...defaultPrayers(), ...o.prayers };
    return {
      leadMinutes,
      prayers,
      jumuah: Boolean(o.jumuah),
      suhoor: Boolean(o.suhoor),
      iftar: Boolean(o.iftar),
    };
  } catch {
    return { ...DEFAULT_REMINDER_PREFS, prayers: defaultPrayers() };
  }
}

async function savePrefs(next: MobileReminderPrefsState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function PrayerReminderPrefs() {
  const [prefs, setPrefs] = useState<MobileReminderPrefsState | null>(null);

  useEffect(() => {
    void loadPrefs().then(setPrefs);
  }, []);

  const persist = useCallback((next: MobileReminderPrefsState) => {
    setPrefs(next);
    void savePrefs(next);
  }, []);

  if (!prefs) {
    return (
      <View style={styles.card}>
        <Text style={styles.muted}>Loading reminder preferences…</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.h2}>Reminder preferences</Text>
      <Text style={styles.caption}>Local only until native notifications (M4).</Text>

      <Text style={styles.sub}>Lead time</Text>
      <View style={styles.chips}>
        {([...REMINDER_OFFSETS_MINUTES] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => persist({ ...prefs, leadMinutes: m })}
            style={[
              styles.chip,
              prefs.leadMinutes === m && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipTxt,
                prefs.leadMinutes === m && styles.chipTxtActive,
              ]}
            >
              {m === 0 ? "At time" : `${m}m`}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sub}>Salah</Text>
      {PRAYER_REMINDER_PRAYERS.map((k) => (
        <View key={k} style={styles.row}>
          <Text style={styles.rowLabel}>{labelPrayer(k)}</Text>
          <Switch
            value={prefs.prayers[k]}
            onValueChange={(v) =>
              persist({
                ...prefs,
                prayers: { ...prefs.prayers, [k]: v },
              })
            }
            trackColor={{ true: emerald, false: border }}
          />
        </View>
      ))}

      <Text style={styles.sub}>Special</Text>
      {PRAYER_SPECIAL_REMINDERS.map((k) => {
        const val =
          k === "jumuah"
            ? prefs.jumuah
            : k === "suhoor"
              ? prefs.suhoor
              : prefs.iftar;
        return (
          <View key={k} style={styles.row}>
            <Text style={styles.rowLabel}>{labelSpecial(k)}</Text>
            <Switch
              value={val}
              onValueChange={(v) =>
                persist({
                  ...prefs,
                  ...(k === "jumuah" ? { jumuah: v } : {}),
                  ...(k === "suhoor" ? { suhoor: v } : {}),
                  ...(k === "iftar" ? { iftar: v } : {}),
                })
              }
              trackColor={{ true: emerald, false: border }}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  h2: { fontSize: fontSizes.lg, fontWeight: "700", color: ink },
  caption: { fontSize: fontSizes.xs, color: muted },
  sub: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    color: bronze,
    marginTop: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  muted: { color: muted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
  },
  chipActive: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.12)",
  },
  chipTxt: { fontSize: fontSizes.sm, color: ink, fontWeight: "600" },
  chipTxtActive: { color: emerald },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  rowLabel: { fontSize: fontSizes.md, color: ink },
});
