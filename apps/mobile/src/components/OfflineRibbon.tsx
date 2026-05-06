import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNetworkStatus } from "../context/NetworkStatusContext";
import { emerald, fontSizes, minTouchTarget, offlineRibbonColors as ribbon, spacing } from "../theme";

/**
 * Thin, calm banner when the device is offline. Retry only pings reachability.
 */
export function OfflineRibbon() {
  const insets = useSafeAreaInsets();
  const { isOffline, recheckNetwork } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      <View style={styles.row} accessibilityRole="alert">
        <Text style={styles.txt} accessibilityLabel="Offline mode. Cached content where available">
          Offline — we are keeping whatever is already on this device nearby. Retry when ready.
        </Text>
        <Pressable
          onPress={recheckNetwork}
          hitSlop={12}
          style={styles.retry}
          accessibilityRole="button"
          accessibilityLabel="Check network again"
        >
          <Text style={styles.retryTxt}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: ribbon.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ribbon.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    minHeight: minTouchTarget,
  },
  txt: {
    flex: 1,
    flexShrink: 1,
    color: ribbon.text,
    fontSize: fontSizes.xs,
    fontWeight: "600",
    lineHeight: 16,
  },
  retry: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: minTouchTarget,
    justifyContent: "center",
  },
  retryTxt: { color: emerald, fontWeight: "800", fontSize: fontSizes.sm },
});
