import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePrayerToday } from "../../src/api/hooks/usePrayerToday";
import { usePrayerMonth } from "../../src/api/hooks/usePrayerMonth";
import { usePrayerRamadan } from "../../src/api/hooks/usePrayerRamadan";
import { PrayerReminderPrefs } from "../../src/components/PrayerReminderPrefs";
import { PrayerTimesCard } from "../../src/components/PrayerTimesCard";
import { NextPrayerCard } from "../../src/components/prayer/NextPrayerCard";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { SettingsGearButton } from "../../src/components/settings/SettingsGearButton";
import { CalmPulseBlock } from "../../src/components/skeleton/CalmSkeleton";
import { LOCATION_FALLBACK } from "../../src/contracts/prayer-preferences";
import {
  PRAYER_PREFERENCES_ROUTE,
  QIBLA_ROUTE,
  SALAH_PLANNER_ROUTE,
  SETTINGS_PROFILE_ROUTE,
} from "../../src/contracts/nav";
import { usePremium } from "../../src/hooks/usePremium";
import { usePremiumFeatureFlags } from "../../src/hooks/usePremiumFeatureFlags";
import {
  refreshStoredDeviceLocation,
} from "../../src/lib/prayer-location";
import {
  readMobilePrayerLocationPrefs,
  writeMobilePrayerLocationPrefs,
} from "../../src/lib/mobile-prayer-prefs";
import {
  readNotificationPermissionRecord,
  requestNotificationPermissions,
  syncNotificationPermissionRecord,
} from "../../src/lib/notifications";
import { bumpPrayerNotificationSchedule } from "../../src/lib/notifications/prayer-schedule-signal";
import {
  CALCULATION_METHOD_OPTIONS,
  MADHAB_OPTIONS,
} from "../../src/lib/prayer/prayer-methods";
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

const FALLBACK_LABEL = "Providence, Rhode Island, United States";

type Seg = "today" | "ramadan" | "calendar" | "preferences";

const SEGMENTS: { id: Seg; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "ramadan", label: "Ramadan" },
  { id: "calendar", label: "Calendar" },
  { id: "preferences", label: "Preferences" },
];

function PrayerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openPaywall } = usePremium();
  const { canUseRamadanPlannerSurfaces } = usePremiumFeatureFlags();
  const plannerUnlocked = canUseRamadanPlannerSurfaces;
  const [section, setSection] = useState<Seg>("today");
  const [city, setCity] = useState<string>(LOCATION_FALLBACK.city);
  const [country, setCountry] = useState<string>(LOCATION_FALLBACK.country);
  const [region, setRegion] = useState<string>(LOCATION_FALLBACK.region);
  const [useDevice, setUseDevice] = useState(false);
  const [locBusy, setLocBusy] = useState(false);
  const [notifyBusy, setNotifyBusy] = useState(false);
  const [notifyHint, setNotifyHint] = useState<string | null>(null);
  const [methodId, setMethodId] = useState<number>(2);
  const [madhab, setMadhab] = useState<0 | 1>(0);
  const [permissionLine, setPermissionLine] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isRefetching } = usePrayerToday();
  const ramadanQ = usePrayerRamadan({ enabled: section === "ramadan" && plannerUnlocked });
  const monthQ = usePrayerMonth({ enabled: section === "calendar" && plannerUnlocked });

  useEffect(() => {
    void readMobilePrayerLocationPrefs().then((p) => {
      if (p) {
        setCity(p.city);
        setCountry(p.country);
        setRegion(p.region ?? LOCATION_FALLBACK.region);
        setUseDevice(p.locationMode === "device");
        setMethodId(typeof p.method === "number" ? p.method : 2);
        setMadhab(p.school === 1 ? 1 : 0);
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await syncNotificationPermissionRecord();
        const snap = await readNotificationPermissionRecord();
        setPermissionLine(snap?.status ?? null);
      })();
    }, []),
  );

  const ok = data && "ok" in data && data.ok;
  const label = ok ? data.locationLabel : FALLBACK_LABEL;

  const invalidatePrayer = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["prayer"] });
  }, [queryClient]);

  const persistMethod = useCallback(
    async (nextId: number) => {
      setMethodId(nextId);
      await writeMobilePrayerLocationPrefs({ method: nextId });
      bumpPrayerNotificationSchedule();
      await invalidatePrayer();
    },
    [invalidatePrayer],
  );

  const persistMadhab = useCallback(
    async (next: 0 | 1) => {
      setMadhab(next);
      await writeMobilePrayerLocationPrefs({ school: next });
      bumpPrayerNotificationSchedule();
      await invalidatePrayer();
    },
    [invalidatePrayer],
  );

  async function saveManualLocation() {
    await writeMobilePrayerLocationPrefs({
      city: city.trim() || LOCATION_FALLBACK.city,
      country: country.trim() || LOCATION_FALLBACK.country,
      region: region.trim() || LOCATION_FALLBACK.region,
      locationMode: "manual",
      latitude: undefined,
      longitude: undefined,
    });
    setUseDevice(false);
    await invalidatePrayer();
    bumpPrayerNotificationSchedule();
  }

  async function onToggleDevice(next: boolean) {
    if (next) {
      setLocBusy(true);
      try {
        const { prefs } = await refreshStoredDeviceLocation();
        setUseDevice(prefs.locationMode === "device");
        await invalidatePrayer();
        bumpPrayerNotificationSchedule();
      } finally {
        setLocBusy(false);
      }
    } else {
      await writeMobilePrayerLocationPrefs({
        locationMode: "manual",
        latitude: undefined,
        longitude: undefined,
      });
      setUseDevice(false);
      await invalidatePrayer();
      bumpPrayerNotificationSchedule();
    }
  }

  async function onRequestNotifications() {
    setNotifyBusy(true);
    setNotifyHint(null);
    try {
      const granted = await requestNotificationPermissions();
      await syncNotificationPermissionRecord();
      const snap = await readNotificationPermissionRecord();
      setPermissionLine(snap?.status ?? (granted ? "granted" : "denied"));
      bumpPrayerNotificationSchedule();
      await invalidatePrayer();
      setNotifyHint(
        granted
          ? "Permission granted — we schedule gentle salah reminders locally with your timings."
          : "Notifications are off — salah times still refresh in-app when you open Today or Prayer.",
      );
    } finally {
      setNotifyBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          section === "today" ? (
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={emerald}
            />
          ) : undefined
        }
      >
        <View style={styles.screenTitleRow}>
          <Text style={styles.h1}>Prayer</Text>
          <SettingsGearButton href={SETTINGS_PROFILE_ROUTE} accessibilityLabel="Settings" />
        </View>
        <Text style={styles.lead}>
          A quiet companion for the day&apos;s rhythm — not a dashboard.
        </Text>

        <Pressable
          style={styles.prefShortcut}
          onPress={() => router.push(SALAH_PLANNER_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Salah Planner"
          accessibilityHint="Plan tasks around today's five prayers"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.prefShortcutTitle}>Salah Planner</Text>
            <Text style={styles.prefShortcutSub}>
              Today&apos;s plan — tasks and reflection around each prayer window
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={muted} />
        </Pressable>

        <Pressable
          style={styles.prefShortcut}
          onPress={() => router.push(QIBLA_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Qibla compass"
          accessibilityHint="Opens the Qibla compass"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.prefShortcutTitle}>Qibla compass</Text>
            <Text style={styles.prefShortcutSub}>
              Find the direction of prayer from where you are
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={muted} />
        </Pressable>

        <Pressable
          style={styles.prefShortcut}
          onPress={() => router.push(PRAYER_PREFERENCES_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Prayer preferences"
          accessibilityHint="Opens Prayer Preferences in Settings"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.prefShortcutTitle}>Prayer preferences</Text>
            <Text style={styles.prefShortcutSub}>
              Times, reminders, location, and calculation — full screen in Settings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={muted} />
        </Pressable>

        <View style={styles.segRow}>
          {SEGMENTS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSection(s.id)}
              style={[styles.seg, section === s.id && styles.segOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: section === s.id }}
            >
              <Text
                style={[styles.segTxt, section === s.id && styles.segTxtOn]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {section === "today" ? (
          <>
            {isLoading ? (
              <View style={styles.center} accessibilityRole="progressbar">
                <CalmPulseBlock height={88} />
                <CalmPulseBlock height={14} style={{ width: "70%", marginTop: spacing.sm }} />
                <Text style={styles.loadingHint}>Arranging salah windows for your locality without rush…</Text>
              </View>
            ) : error ? (
              <View style={styles.card}>
                <Text style={styles.calmOfflineTitle}>Prayer times are pausing</Text>
                <Text style={styles.calmOfflineBody}>
                  Check your connection, or try manual city under Preferences below. Nothing is wrong with salah itself — only this fetch needs a quieter moment online.
                </Text>
                {__DEV__ && error instanceof Error ? (
                  <Text style={styles.bannerMeta}>{error.message}</Text>
                ) : null}
                <Pressable
                  onPress={() => void refetch()}
                  style={styles.primaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading prayer times"
                >
                  <Text style={styles.primaryBtnTxt}>
                    {isRefetching ? "Refreshing…" : "Try again gently"}
                  </Text>
                </Pressable>
              </View>
            ) : ok ? (
              <View style={styles.gap}>
                <NextPrayerCard
                  data={data}
                  showFallback
                  onManageReminders={() => setSection("preferences")}
                />
                <View style={styles.card}>
                  <Text style={styles.k}>Your locality</Text>
                  <Text style={styles.bodyStrong}>{label}</Text>
                  <Text style={styles.hijri}>{data.hijriLabel}</Text>
                  <Text style={styles.rowMeta}>
                    Now · {data.schedule.currentPrayer ?? "—"} ({data.schedule.currentLabel})
                  </Text>
                </View>
                <PrayerTimesCard
                  timings={data.timings}
                  nextPrayer={data.schedule.nextPrayer}
                  currentPrayer={data.schedule.currentPrayer}
                />
              </View>
            ) : data && "ok" in data && !data.ok ? (
              <View style={styles.card}>
                <Text style={styles.calmOfflineTitle}>Prayer times need a quieter moment online</Text>
                <Text style={styles.calmOfflineBody}>
                  Pull down softly to retry, or open Settings → Preferences → Location if your city shifted. Technical messages stay out of view so the screen stays peaceful.
                </Text>
                {__DEV__ && typeof data.error === "string" ? (
                  <Text style={styles.bannerMeta}>{data.error}</Text>
                ) : null}
                <Pressable
                  onPress={() => void refetch()}
                  style={styles.primaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading prayer times"
                >
                  <Text style={styles.primaryBtnTxt}>
                    {isRefetching ? "Refreshing…" : "Try again gently"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}

        {section === "ramadan" ? (
          plannerUnlocked ? (
            <View style={styles.card}>
              <Text style={styles.k}>Ramadan window</Text>
              {ramadanQ.isLoading ? (
                <View style={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
                  <CalmPulseBlock height={48} accessibilityLabel="Ramadan timetable placeholder" />
                  <CalmPulseBlock height={12} style={{ width: "92%" }} />
                </View>
              ) : ramadanQ.error ? (
                <>
                  <Text style={styles.muted}>
                    Ramadan dates could not load right now. Pull to refresh on Today or check your connection.
                  </Text>
                  {__DEV__ && ramadanQ.error instanceof Error ? (
                    <Text style={styles.bannerMeta}>{ramadanQ.error.message}</Text>
                  ) : null}
                </>
              ) : ramadanQ.data &&
                "ok" in ramadanQ.data &&
                ramadanQ.data.ok ? (
                <>
                  <Text style={styles.body}>
                    Hijri year reference: {ramadanQ.data.hijriYear}.
                    Gregorian overlap month:{" "}
                    {ramadanQ.data.gregorianMonth ?? "—"} /{" "}
                    {ramadanQ.data.gregorianYear ?? "—"}.
                  </Text>
                  <Text style={styles.muted}>
                    Detailed fasting boundaries depend on your locality and sighting conventions — stay gentle with your
                    community&apos;s guidance. Times for today still reflect your Prayer tab baseline.
                  </Text>
                </>
              ) : (
                <Text style={styles.muted}>Ramadan data unavailable for this request.</Text>
              )}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.k}>Ramadan window</Text>
              <Text style={styles.body}>
                Month-aware overlays, tarawīh scaffolding, and this seasonal card stay with DeenNotes Plus subscribers.
              </Text>
              <Pressable style={styles.primaryBtn} onPress={() => openPaywall("ramadan_planning")}>
                <Text style={styles.primaryBtnTxt}>Explore Plus calmly</Text>
              </Pressable>
            </View>
          )
        ) : null}

        {section === "calendar" ? (
          plannerUnlocked ? (
            <View style={styles.card}>
              <Text style={styles.k}>Month at a glance</Text>
              {monthQ.isLoading ? (
                <View style={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
                  <CalmPulseBlock height={52} accessibilityLabel="Prayer month grid placeholder" />
                  <CalmPulseBlock height={12} style={{ width: "84%" }} />
                  <CalmPulseBlock height={12} style={{ width: "76%" }} />
                </View>
              ) : monthQ.error ? (
                <>
                  <Text style={styles.muted}>
                    The month view could not load. Check your connection or try again in a moment.
                  </Text>
                  {__DEV__ && monthQ.error instanceof Error ? (
                    <Text style={styles.bannerMeta}>{monthQ.error.message}</Text>
                  ) : null}
                </>
              ) : monthQ.data?.days?.length ? (
                <>
                  <Text style={styles.body}>
                    {monthQ.data.locationLabel} · {monthQ.data.month}/{monthQ.data.year}
                  </Text>
                  {monthQ.data.days.slice(0, 7).map((d) => (
                    <View key={d.gregorianReadable} style={styles.calRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.calG}>{d.gregorianReadable}</Text>
                        <Text style={styles.calH}>{d.hijriLabel}</Text>
                      </View>
                      <Text style={styles.calT}>{d.timings.Fajr}</Text>
                      <Text style={styles.calT}>{d.timings.Maghrib}</Text>
                    </View>
                  ))}
                  <Text style={styles.muted}>
                    Showing the first seven days — full grid interactions come later.
                  </Text>
                </>
              ) : (
                <Text style={styles.muted}>No days in response.</Text>
              )}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.k}>Month at a glance</Text>
              <Text style={styles.body}>
                Planner-style month strips stay with DeenNotes Plus — today&apos;s salah times remain open for everyone.
              </Text>
              <Pressable style={styles.primaryBtn} onPress={() => openPaywall("ramadan_planning")}>
                <Text style={styles.primaryBtnTxt}>Unlock planner tools</Text>
              </Pressable>
            </View>
          )
        ) : null}

        {section === "preferences" ? (
          <View style={styles.gap}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.muted}>
                Precise location uses your device coordinates when permitted.
                Otherwise we fall back to city & country (default{" "}
                {FALLBACK_LABEL}).
              </Text>
              <Text style={styles.current}>Now showing: {label}</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLab}>Use precise location</Text>
                <Switch
                  value={useDevice}
                  disabled={locBusy}
                  onValueChange={(v) => void onToggleDevice(v)}
                  trackColor={{ true: emerald, false: border }}
                />
              </View>

              <Pressable
                onPress={() => void onToggleDevice(true)}
                disabled={locBusy}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnTxt}>
                  {locBusy ? "Updating…" : "Refresh location fix"}
                </Text>
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={muted}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={styles.input}
                placeholder="Region / state"
                placeholderTextColor={muted}
                value={region}
                onChangeText={setRegion}
              />
              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor={muted}
                value={country}
                onChangeText={setCountry}
              />
              <Pressable
                onPress={() => void saveManualLocation()}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnTxt}>Save manual place</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Calculation method</Text>
              <Text style={styles.muted}>
                AlAdhan timings — choose the convention that matches your locality.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.methodStrip}
              >
                {CALCULATION_METHOD_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => void persistMethod(opt.id)}
                    style={[styles.methodChip, methodId === opt.id && styles.methodChipOn]}
                  >
                    <Text
                      style={[
                        styles.methodChipTxt,
                        methodId === opt.id && styles.methodChipTxtOn,
                      ]}
                      numberOfLines={2}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Madhab</Text>
              <Text style={styles.muted}>Affects Asr — paired with the calculation method above.</Text>
              <View style={styles.madhRow}>
                {MADHAB_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => void persistMadhab(opt.id)}
                    style={[styles.rowMadhabChip, madhab === opt.id && styles.methodChipOn]}
                  >
                    <Text style={[styles.methodChipTxt, madhab === opt.id && styles.methodChipTxtOn]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <PrayerReminderPrefs
              advancedUnlocked={plannerUnlocked}
              onRequestAdvanced={() => openPaywall("advanced_prayer_reminders")}
              onAfterChange={() => void invalidatePrayer()}
            />

            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>Notifications</Text>
              <Text style={styles.bannerBody}>
                Quiet local reminders timed to your salah — no marketing. You can decline; you can try again anytime from Prayer → Preferences.
              </Text>
              {permissionLine ? (
                <Text style={styles.bannerMeta}>System permission: {permissionLine}</Text>
              ) : null}
              <Pressable
                onPress={() => void onRequestNotifications()}
                disabled={notifyBusy}
                style={styles.primaryBtn}
                accessibilityRole="button"
                accessibilityHint="Opens the system dialog for notification permission"
              >
                <Text style={styles.primaryBtnTxt}>
                  {notifyBusy ? "Opening…" : "Allow reminders (you can refuse)"}
                </Text>
              </Pressable>
              {notifyHint ? (
                <Text style={styles.bannerHint}>{notifyHint}</Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PrayerScreenExported() {
  return (
    <ScreenErrorBoundary scope="prayer-tab">
      <PrayerScreen />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 48, gap: spacing.md },
  screenTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  h1: {
    fontFamily: fontSerifHeading,
    fontSize: 28,
    fontWeight: "600",
    color: ink,
  },
  lead: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  prefShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    marginBottom: spacing.sm,
  },
  prefShortcutTitle: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  prefShortcutSub: { fontSize: fontSizes.xs, color: muted, marginTop: 4, lineHeight: 18 },
  segRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  seg: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    minHeight: 44,
    justifyContent: "center",
  },
  segOn: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.1)",
  },
  segTxt: { fontSize: fontSizes.sm, fontWeight: "700", color: ink },
  segTxtOn: { color: emerald },
  gap: { gap: spacing.md },
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
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
  sectionTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: ink,
  },
  body: { fontSize: fontSizes.sm, color: ink, lineHeight: 22 },
  bodyStrong: { fontSize: fontSizes.md, fontWeight: "700", color: ink },
  hijri: { fontSize: fontSizes.md, color: ink, fontWeight: "600" },
  rowMeta: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  current: { fontSize: fontSizes.sm, fontWeight: "600", color: ink },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  switchLab: { fontSize: fontSizes.md, color: ink, flex: 1, marginRight: spacing.md },
  banner: {
    backgroundColor: "rgba(18,122,99,0.08)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bannerTitle: { fontSize: fontSizes.sm, fontWeight: "800", color: emerald },
  bannerBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  bannerHint: { fontSize: fontSizes.sm, color: ink, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fontSizes.md,
    color: ink,
    minHeight: 48,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 44,
    justifyContent: "center",
  },
  secondaryBtnTxt: { color: emerald, fontWeight: "700", fontSize: fontSizes.sm },
  center: { paddingVertical: 32, alignItems: "center", gap: spacing.md },
  loadingHint: {
    fontSize: fontSizes.sm,
    color: muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  calmOfflineTitle: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: bronze,
  },
  calmOfflineBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 22 },
  calRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: border,
  },
  calG: { fontSize: fontSizes.sm, fontWeight: "600", color: ink },
  calH: { fontSize: fontSizes.xs, color: muted },
  calT: {
    fontSize: fontSizes.sm,
    color: muted,
    fontVariant: ["tabular-nums"],
    width: 56,
    textAlign: "right",
  },
  methodStrip: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  methodChip: {
    maxWidth: 220,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
    flexShrink: 0,
    width: 160,
    justifyContent: "center",
  },
  rowMadhabChip: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: stone,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  methodChipOn: {
    borderColor: emerald,
    backgroundColor: "rgba(18,122,99,0.1)",
  },
  methodChipTxt: { fontSize: 11, color: ink, fontWeight: "600", textAlign: "center" },
  methodChipTxtOn: { color: emerald },
  madhRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  bannerMeta: { fontSize: fontSizes.xs, color: bronze },
});
