import { Image, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  /** Raster height after scale; width scales with PNG aspect ratio. */
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** Larger hit area for onboarding / sheet headers */
  padded?: boolean;
};

/**
 * In-app raster from {@link ../../scripts/export-mobile-brand-icons.cjs} → `wordmark-compact-mobile.png`.
 * Run `npm run mobile:icons` after changing SVGs under `public/brand/`.
 */
export function MobileWordmark({ height = 32, style, padded }: Props) {
  return (
    <View style={[{ alignSelf: "center", paddingVertical: padded ? 4 : 0 }, style]}>
      <Image
        accessibilityLabel="DeenNotes"
        accessibilityRole="image"
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={require("../../../assets/wordmark-compact-mobile.png")}
        style={{ height, width: height * 4.25 }}
      />
    </View>
  );
}
