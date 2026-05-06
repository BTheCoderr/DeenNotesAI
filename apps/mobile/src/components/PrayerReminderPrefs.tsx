import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import {
  PRAYER_REMINDER_PRAYERS,
  PRAYER_SPECIAL_REMINDERS,
  REMINDER_OFFSETS_MINUTES,
} from "../contracts/prayer-preferences";
import { bumpPrayerNotificationSchedule } from "../lib/notifications/prayer-schedule-signal";
import {
  readMobileReminderPrefs,
  writeMobileReminderPrefs,
  type MobileReminderPrefsState,
} from "../lib/prayer-reminder-storage";
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

export function PrayerReminderPrefs({ onAfterChange }: { onAfterChange?: () => void }) {
  const [prefs, setPrefs] = useState<MobileReminderPrefsState | null>(null);

  useEffect(() => {
    void readMobileReminderPrefs().then(setPrefs);
  }, []);

  const persist = useCallback(
    (next: MobileReminderPrefsState) => {
      setPrefs(next);
      void writeMobileReminderPrefs(next).then(() => {
        bumpPrayerNotificationSchedule();
        onAfterChange?.();
      });
    },
    [onAfterChange],
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

      <Text style={styles.sub}>Lead time</Text>
      <View style={styles.chips}>
        {([...REMINDER_OFFSETS_MINUTES] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => persist({ ...prefs, leadMinutes: m })}
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
          k === "jumuah" ? prefs.jumuah : k === "suhoor" ? prefs.suhoor : prefs.iftar;
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
