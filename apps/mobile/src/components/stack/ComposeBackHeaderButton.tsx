import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useNavigation, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { safeBack } from "../../lib/navigation/safe-back";
import { emerald } from "../../theme";

type Props = { fallback?: Href };

/** Native-stack back affordance reinforcement for compose flows opened from modal. */
export function ComposeBackHeaderButton({ fallback = "/(tabs)" }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => safeBack(router, navigation, fallback)}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="chevron-back" size={28} color={emerald} accessibilityElementsHidden />
    </Pressable>
  );
}
