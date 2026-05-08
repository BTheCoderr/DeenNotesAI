import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { border, cardBg, emerald, minTouchTarget, radii } from "../../theme";

type Props = {
  /** Target route (same paths as existing Settings entry points). */
  href: Href;
  accessibilityLabel?: string;
};

/**
 * Icon-only Settings entry aligned with tab headers — keeps navigation paths unchanged.
 */
export function SettingsGearButton({ href, accessibilityLabel = "Settings" }: Props) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      <Ionicons name="settings-outline" size={22} color={emerald} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: border,
    backgroundColor: cardBg,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: "rgba(18,122,99,0.08)",
  },
});
