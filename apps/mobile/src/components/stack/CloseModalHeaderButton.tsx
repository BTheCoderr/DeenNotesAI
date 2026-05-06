import type { Href } from "expo-router";
import { useNavigation, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

import { safeBack } from "../../lib/navigation/safe-back";
import { emerald, fontSizes } from "../../theme";

type Props = {
  /** iOS modal convention is "Close"; stack children often read better as "Back". */
  label?: string;
  fallback?: Href;
};

export function CloseModalHeaderButton({ label = "Close", fallback = "/(tabs)" }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => safeBack(router, navigation, fallback)}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={{ color: emerald, fontSize: fontSizes.md, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
