import { Image, type ImageStyle, type StyleProp } from "react-native";

/** Single source: `assets/icon.png` — DN green rounded-square (Expo app icon). */
const SOURCE = require("../../../assets/icon.png");

type Props = {
  /** Square edge length; keeps 1:1 aspect ratio. */
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function DeenNotesAppIconMark({
  size = 48,
  style,
  accessibilityLabel = "DeenNotes",
}: Props) {
  return (
    <Image
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      source={SOURCE}
      resizeMode="contain"
      style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
    />
  );
}
