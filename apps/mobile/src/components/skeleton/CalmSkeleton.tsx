import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, View, type StyleProp, type ViewStyle } from "react-native";

import { radii, spacing } from "../../theme";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduced)
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduced);
    return () => sub?.remove?.();
  }, []);
  return reduced;
}

type PulseProps = {
  height: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Gentle breathing skeleton block — honours Reduce Motion. */
export function CalmPulseBlock({ height, style, accessibilityLabel }: PulseProps) {
  const reduced = usePrefersReducedMotion();
  const op = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    if (reduced) {
      op.setValue(0.52);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.64, duration: 900, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.38, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, op]);

  return (
    <Animated.View
      accessibilityLabel={accessibilityLabel ?? "Content preparing"}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          height,
          alignSelf: "stretch",
          borderRadius: radii.md,
          backgroundColor: "rgba(0,0,0,0.07)",
          opacity: op,
        },
        style,
      ]}
    />
  );
}

export function SkeletonHeroCard({ lines = 4 }: { lines?: number }) {
  return (
    <>
      <CalmPulseBlock height={96} accessibilityLabel="Today greeting placeholder" />
      <CalmPulseBlock height={14} style={{ marginTop: spacing.md, width: "62%" }} />
      {Array.from({ length: lines }).map((_, i) => (
        <CalmPulseBlock
          key={i}
          height={12}
          style={{ marginTop: spacing.sm, width: i === lines - 1 ? "42%" : "88%" }}
        />
      ))}
    </>
  );
}

export function SkeletonReflectList() {
  return (
    <View style={{ gap: spacing.md, paddingVertical: spacing.sm }}>
      {[0, 1, 2].map((i) => (
        <CalmPulseBlock key={i} height={72} accessibilityLabel={"Reflection placeholder " + String(i + 1)} />
      ))}
    </View>
  );
}
