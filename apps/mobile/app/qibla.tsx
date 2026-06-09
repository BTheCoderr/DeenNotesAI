import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenErrorBoundary } from "../src/components/ScreenErrorBoundary";
import { LOCATION_FALLBACK } from "../src/contracts/prayer-preferences";
import { useDeviceHeading } from "../src/hooks/useDeviceHeading";
import { readMobilePrayerLocationPrefs } from "../src/lib/mobile-prayer-prefs";
import { refreshStoredDeviceLocation } from "../src/lib/prayer-location";
import {
  bearingToKaaba,
  formatBearing,
  qiblaNeedleRotation,
} from "../src/lib/qibla";
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
} from "../src/theme";

type Coords = {
  latitude: number;
  longitude: number;
  label: string;
  approximate: boolean;
};

export default function QiblaScreen() {
  return (
    <ScreenErrorBoundary scope="qibla">
      <QiblaScreenInner />
    </ScreenErrorBoundary>
  );
}

function QiblaScreenInner() {
  const router = useRouter();
  const { heading, available, error: sensorError } = useDeviceHeading(true);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCoords = useCallback(async () => {
    setRefreshing(true);
    try {
      let prefs = await readMobilePrayerLocationPrefs();

      if (
        prefs?.latitude != null &&
        prefs.longitude != null &&
        Number.isFinite(prefs.latitude) &&
        Number.isFinite(prefs.longitude)
      ) {
        setCoords({
          latitude: prefs.latitude,
          longitude: prefs.longitude,
          label: `${prefs.city}, ${prefs.country}`,
          approximate: prefs.locationMode !== "device",
        });
        return;
      }

      const refreshed = await refreshStoredDeviceLocation();
      prefs = refreshed.prefs;
      if (
        prefs.latitude != null &&
        prefs.longitude != null &&
        Number.isFinite(prefs.latitude) &&
        Number.isFinite(prefs.longitude)
      ) {
        setCoords({
          latitude: prefs.latitude,
          longitude: prefs.longitude,
          label: `${prefs.city}, ${prefs.country}`,
          approximate: refreshed.permission !== "granted",
        });
        return;
      }

      setCoords({
        latitude: LOCATION_FALLBACK.latitude,
        longitude: LOCATION_FALLBACK.longitude,
        label: `${prefs?.city ?? LOCATION_FALLBACK.city} — enable location for accuracy`,
        approximate: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadCoords();
    }, [loadCoords]),
  );

  const qiblaBearing = useMemo(() => {
    if (!coords) return null;
    return bearingToKaaba(coords.latitude, coords.longitude);
  }, [coords]);

  const needleRotation =
    heading != null && qiblaBearing != null
      ? qiblaNeedleRotation(heading, qiblaBearing)
      : null;

  const aligned =
    needleRotation != null && (needleRotation <= 8 || needleRotation >= 352);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Hold your phone flat and turn slowly until the arrow points up — that is the direction of
          the Kaaba from where you are.
        </Text>

        {loading ? (
          <View style={styles.loadingBox} accessibilityRole="progressbar">
            <ActivityIndicator color={emerald} size="large" />
            <Text style={styles.loadingHint}>Finding your location…</Text>
          </View>
        ) : (
          <>
            <View style={styles.compassWrap}>
              <View style={styles.compassRing}>
                <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
                <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
                <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
                <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

                <View style={styles.compassInner}>
                  {needleRotation != null ? (
                    <View
                      style={[
                        styles.needleWrap,
                        { transform: [{ rotate: `${needleRotation}deg` }] },
                      ]}
                    >
                      <View style={styles.needleHead} />
                      <View style={styles.needleTail} />
                    </View>
                  ) : (
                    <Ionicons name="compass-outline" size={48} color={muted} />
                  )}
                  <View style={styles.kaabaDot}>
                    <Text style={styles.kaabaGlyph}>🕋</Text>
                  </View>
                </View>
              </View>

              {aligned ? (
                <Text style={styles.alignedTxt}>Facing Qibla — allahu akbar</Text>
              ) : null}
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLbl}>Qibla bearing</Text>
                <Text style={styles.statVal}>
                  {qiblaBearing != null ? formatBearing(qiblaBearing) : "—"}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLbl}>Device heading</Text>
                <Text style={styles.statVal}>
                  {heading != null ? formatBearing(heading) : "—"}
                </Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLbl}>From</Text>
                <Text style={[styles.statVal, styles.statValSmall]} numberOfLines={2}>
                  {coords?.label ?? "—"}
                  {coords?.approximate ? " (approx.)" : ""}
                </Text>
              </View>
            </View>

            {!available || sensorError ? (
              <View style={styles.banner}>
                <Text style={styles.bannerTxt}>
                  {sensorError ??
                    "Compass sensors need a physical iPhone — simulators cannot show live heading."}
                </Text>
              </View>
            ) : null}

            {coords?.approximate ? (
              <View style={styles.banner}>
                <Text style={styles.bannerTxt}>
                  For a precise bearing, allow location on the Prayer tab or in Settings → Location.
                </Text>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => router.push("/settings/location")}
                  accessibilityRole="button"
                >
                  <Text style={styles.linkBtnTxt}>Open location settings</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              style={styles.refreshBtn}
              onPress={() => void loadCoords()}
              disabled={refreshing}
              accessibilityRole="button"
              accessibilityLabel="Refresh location"
            >
              <Ionicons name="refresh-outline" size={20} color={emerald} />
              <Text style={styles.refreshTxt}>
                {refreshing ? "Refreshing…" : "Refresh location"}
              </Text>
            </Pressable>

            <View style={styles.note}>
              <Text style={styles.noteKicker}>Calm reminder</Text>
              <Text style={styles.noteBody}>
                Magnetic interference from cases, metal desks, or electronics can shift the needle.
                Step outside or recalibrate by moving the phone in a figure-eight if readings drift.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const COMPASS_SIZE = 280;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  lead: {
    fontSize: fontSizes.sm,
    color: muted,
    lineHeight: 22,
    paddingTop: spacing.sm,
  },
  loadingBox: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  loadingHint: { fontSize: fontSizes.sm, color: muted },
  compassWrap: { alignItems: "center", gap: spacing.md },
  compassRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    borderColor: emerald,
    backgroundColor: cardBg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  compassInner: {
    width: COMPASS_SIZE - 48,
    height: COMPASS_SIZE - 48,
    borderRadius: (COMPASS_SIZE - 48) / 2,
    backgroundColor: "rgba(18,122,99,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardinal: {
    position: "absolute",
    fontSize: fontSizes.sm,
    fontWeight: "800",
    color: bronze,
  },
  cardinalN: { top: 12, alignSelf: "center" },
  cardinalE: { right: 16, top: COMPASS_SIZE / 2 - 10 },
  cardinalS: { bottom: 12, alignSelf: "center" },
  cardinalW: { left: 16, top: COMPASS_SIZE / 2 - 10 },
  needleWrap: {
    position: "absolute",
    width: 8,
    height: COMPASS_SIZE - 80,
    alignItems: "center",
    justifyContent: "center",
  },
  needleHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 56,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: emerald,
    marginBottom: 2,
  },
  needleTail: {
    width: 4,
    height: 48,
    backgroundColor: muted,
    borderRadius: 2,
  },
  kaabaDot: {
    position: "absolute",
    top: 8,
    alignItems: "center",
  },
  kaabaGlyph: { fontSize: 18 },
  alignedTxt: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.md,
    color: emerald,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: cardBg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border,
  },
  statRowLast: { borderBottomWidth: 0 },
  statLbl: { fontSize: fontSizes.sm, color: muted, flex: 1 },
  statVal: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: ink,
    fontVariant: ["tabular-nums"],
  },
  statValSmall: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    textAlign: "right",
    flex: 1.2,
  },
  banner: {
    backgroundColor: "rgba(184,134,11,0.1)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(184,134,11,0.3)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  bannerTxt: { fontSize: fontSizes.sm, color: ink, lineHeight: 20 },
  linkBtn: { alignSelf: "flex-start" },
  linkBtnTxt: { fontSize: fontSizes.sm, fontWeight: "700", color: emerald },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
    minHeight: 48,
  },
  refreshTxt: { fontSize: fontSizes.md, fontWeight: "700", color: emerald },
  note: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: "rgba(18,122,99,0.05)",
    gap: spacing.xs,
  },
  noteKicker: {
    fontSize: fontSizes.xs,
    fontWeight: "800",
    color: bronze,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  noteBody: { fontSize: fontSizes.sm, color: muted, lineHeight: 20 },
});
