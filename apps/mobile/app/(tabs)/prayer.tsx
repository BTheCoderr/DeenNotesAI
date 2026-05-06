import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { prayerTodayQueryKey, usePrayerToday } from "../../src/api/hooks/usePrayerToday";
import { PrayerReminderPrefs } from "../../src/components/PrayerReminderPrefs";
import { PrayerTimesCard } from "../../src/components/PrayerTimesCard";
import { LOCATION_FALLBACK } from "../../src/contracts/prayer-preferences";
import {
  readMobilePrayerLocationPrefs,
  writeMobilePrayerLocationPrefs,
} from "../../src/lib/mobile-prayer-prefs";
import { border, cardBg, emerald, fontSizes, ink, muted, radii, spacing, stone } from "../../src/theme";

const FALLBACK_LABEL = "Providence, Rhode Island, United States";

export default function PrayerScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch, isRefetching } = usePrayerToday();
  const [city, setCity] = useState<string>(LOCATION_FALLBACK.city);
  const [country, setCountry] = useState<string>(LOCATION_FALLBACK.country);
  const [region, setRegion] = useState<string>(LOCATION_FALLBACK.region);

  useEffect(() => {
    void readMobilePrayerLocationPrefs().then((p) => {
      if (p) {
        setCity(p.city);
        setCountry(p.country);
        setRegion(p.region ?? LOCATION_FALLBACK.region);
      }
    });
  }, []);

  async function saveLocation() {
    await writeMobilePrayerLocationPrefs({
      city: city.trim() || LOCATION_FALLBACK.city,
      country: country.trim() || LOCATION_FALLBACK.country,
      region: region.trim() || LOCATION_FALLBACK.region,
      method: 2,
      school: 0,
    });
    await queryClient.invalidateQueries({ queryKey: prayerTodayQueryKey });
  }

  const ok = data && "ok" in data && data.ok;
  const label = ok ? data.locationLabel : FALLBACK_LABEL;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Prayer</Text>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Notifications</Text>
          <Text style={styles.bannerBody}>
            Native local notifications for salah reminders are planned for the next release (M4).
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.muted}>
            Defaults to shared fallback: {FALLBACK_LABEL}. Adjust city to match your locality.
          </Text>
          <Text style={styles.current}>Now showing: {label}</Text>
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
          <Pressable onPress={() => void saveLocation()} style={styles.saveBtn}>
            <Text style={styles.saveBtnTxt}>Save & refresh times</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={emerald} />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.err}>{error instanceof Error ? error.message : "Error"}</Text>
            <Pressable onPress={() => void refetch()} style={styles.saveBtn}>
              <Text style={styles.saveBtnTxt}>{isRefetching ? "Loading…" : "Retry"}</Text>
            </Pressable>
          </View>
        ) : ok ? (
          <PrayerTimesCard
            timings={data.timings}
            nextPrayer={data.schedule.nextPrayer}
            currentPrayer={data.schedule.currentPrayer}
          />
        ) : data && "ok" in data && !data.ok ? (
          <View style={styles.card}>
            <Text style={styles.err}>{data.error}</Text>
            <Pressable onPress={() => void refetch()} style={styles.saveBtn}>
              <Text style={styles.saveBtnTxt}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <PrayerReminderPrefs />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 48, gap: spacing.md },
  h1: { fontSize: 28, fontWeight: "700", color: ink, marginBottom: spacing.xs },
  banner: {
    backgroundColor: "rgba(18,122,99,0.1)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: 6,
  },
  bannerTitle: { fontSize: fontSizes.sm, fontWeight: "800", color: emerald },
  bannerBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  card: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: "700", color: ink },
  muted: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
  current: { fontSize: fontSizes.sm, fontWeight: "600", color: ink },
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
  saveBtn: {
    alignSelf: "flex-start",
    backgroundColor: emerald,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minHeight: 48,
    justifyContent: "center",
  },
  saveBtnTxt: { color: "#fff", fontWeight: "700" },
  center: { paddingVertical: 32, alignItems: "center" },
  err: { color: "#8b2942", fontSize: fontSizes.sm },
});
