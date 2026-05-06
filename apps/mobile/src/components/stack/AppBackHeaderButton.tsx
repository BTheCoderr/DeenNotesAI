import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useNavigation, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { safeBack } from "../../lib/navigation/safe-back";
import { emerald, minTouchTarget } from "../../theme";

type Props = {
  fallback?: Href;
  accessibilityLabel?: string;
};

/**
 * Stack back affordance with `safeBack` so deep links without history `replace` to a tab or hub route.
 */
export function AppBackHeaderButton({
  fallback = "/(tabs)",
  accessibilityLabel = "Go back",
}: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => safeBack(router, navigation, fallback)}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: minTouchTarget,
        height: minTouchTarget,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Ionicons name="chevron-back" size={28} color={emerald} />
    </Pressable>
  );
}
