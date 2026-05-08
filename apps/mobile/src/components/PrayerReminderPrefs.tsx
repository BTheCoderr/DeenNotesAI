import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import {
  PRAYER_REMINDER_PRAYERS,
  PRAYER_SPECIAL_REMINDERS,
} from "../contracts/prayer-preferences";
import { bumpPrayerNotificationSchedule } from "../lib/notifications/prayer-schedule-signal";
import {
  readMobileReminderPrefs,
  writeMobileReminderPrefs,
  type MobileReminderPrefsState,
} from "../lib/prayer-reminder-storage";
import { requestNotificationPermissions, syncNotificationPermissionRecord } from "../lib/notifications";
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

function labelPrayer(k: string): string {
  return k.slice(0, 1).toUpperCase() + k.slice(1);
}

function labelSpecial(k: string): string {
  if (k === "jumuah") return "Jumu'ah";
  if (k === "suhoor") return "Suhoor";
  if (k === "iftar") return "Iftar";
  return k;
}

function schedulingActive(p: MobileReminderPrefsState, advancedUnlocked: boolean): boolean {
  const salah = PRAYER_REMINDER_PRAYERS.some((k) => p.prayers[k]);
  const special =
    advancedUnlocked && (p.jumuah || p.suhoor || p.iftar);
  return salah || Boolean(special);
}

function togglingReminderOn(
  prev: MobileReminderPrefsState,
  next: MobileReminderPrefsState,
  advancedUnlocked: boolean,
): boolean {
  if (!schedulingActive(prev, advancedUnlocked) && schedulingActive(next, advancedUnlocked)) {
    return true;
  }
  if (PRAYER_REMINDER_PRAYERS.some((k) => next.prayers[k] && !prev.prayers[k])) return true;
  if (
    advancedUnlocked &&
    ((!prev.jumuah && next.jumuah) ||
      (!prev.suhoor && next.suhoor) ||
      (!prev.iftar && next.iftar))
  )
    return true;
  return false;
}

export function PrayerReminderPrefs({
  onAfterChange,
  advancedUnlocked,
  onRequestAdvanced,
}: {
  onAfterChange?: () => void;
  advancedUnlocked: boolean;
  onRequestAdvanced: () => void;
}) {
  const [prefs, setPrefs] = useState<MobileReminderPrefsState | null>(null);

  useEffect(() => {
    void readMobileReminderPrefs().then(setPrefs);
  }, []);

  const applyPrefs = useCallback(
    async (next: MobileReminderPrefsState) => {
      if (!prefs) return;
      const prev = prefs;

      const want = schedulingActive(next, advancedUnlocked);
      const turnOn = togglingReminderOn(prev, next, advancedUnlocked);

      if (turnOn) {
        const granted = await requestNotificationPermissions();
        await syncNotificationPermissionRecord();
        if (!granted) {
          Alert.alert(
            "Notifications muted",
            "We can schedule gentle salah reminders locally after notifications are allowed. Prayer times stay available anytime you open Prayer or Today.",
          );
          return;
        }
      } else if (want && next.leadMinutes !== prev.leadMinutes) {
        await requestNotificationPermissions();
        await syncNotificationPermissionRecord();
      }

      setPrefs(next);
      await writeMobileReminderPrefs(next);
      bumpPrayerNotificationSchedule();
      onAfterChange?.();
    },
    [advancedUnlocked, onAfterChange, prefs],
  );

  if (!prefs) {
    return (
      <View style={styles.card}>
        <Text style={styles.muted}>Waking reminder preferences gently…</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.h2}>Notification preferences</Text>
      <Text style={styles.caption}>
        Calm local reminders only — synced with salah times from AlAdhan for this locality.
      </Text>

      {!advancedUnlocked ? (
        <Text style={[styles.caption, { marginTop: spacing.sm }]}>
          The five daily salah toggles plus calm lead-times (including at adhān) stay open — speciality reminders remain
          with DeenNotes Plus.
        </Text>
      ) : null}

      <Text style={styles.sub}>Lead time</Text>
      <View style={styles.chips}>
        {(advancedUnlocked || prefs.leadMinutes === 30
          ? ([0, 5, 10, 15, 30] as const)
          : ([0, 5, 10, 15] as const)
        ).map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              if (m === 30 && !advancedUnlocked) {
                onRequestAdvanced();
                return;
              }
              void applyPrefs({ ...prefs, leadMinutes: m });
            }}
            style={[styles.chip, prefs.leadMinutes === m && styles.chipActive]}
          >
            <Text style={[styles.chipTxt, prefs.leadMinutes === m && styles.chipTxtActive]}>
              {m === 0 ? "At time" : `${m}m before`}
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
            onValueChange={(v) => void applyPrefs({ ...prefs, prayers: { ...prefs.prayers, [k]: v } })}
            trackColor={{ true: emerald, false: border }}
          />
        </View>
      ))}

      <Text style={styles.sub}>Special</Text>
      {PRAYER_SPECIAL_REMINDERS.map((k) => {
        const val =
          k === "jumuah" ? prefs.jumuah : k === "suhoor" ? prefs.suhoor : prefs.iftar;
        return (
          <View key={k} style={styles.row}>
            <Text style={styles.rowLabel}>{labelSpecial(k)}</Text>
            <Switch
              value={val}
              onValueChange={(v) => {
                if (!advancedUnlocked) {
                  onRequestAdvanced();
                  return;
                }
                void applyPrefs({
                  ...prefs,
                  ...(k === "jumuah" ? { jumuah: v } : {}),
                  ...(k === "suhoor" ? { suhoor: v } : {}),
                  ...(k === "iftar" ? { iftar: v } : {}),
                });
              }}
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
