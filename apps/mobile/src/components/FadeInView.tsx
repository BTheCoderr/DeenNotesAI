import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";

import { motion } from "../theme/design-tokens";

/**
 * Subtle opacity fade on mount. Skips animation when Reduce Motion is enabled.
 */
export function FadeInView({ children }: PropsWithChildren) {
  const op = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled?.()
      .then((rm) => {
        if (cancelled) return;
        if (rm) {
          op.setValue(1);
        } else {
          Animated.timing(op, {
            toValue: 1,
            duration: motion.durationFast,
            useNativeDriver: true,
          }).start();
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          op.setValue(1);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [op]);

  if (!ready) return <Animated.View style={{ opacity: 0 }}>{children}</Animated.View>;
  return <Animated.View style={{ opacity: op }}>{children}</Animated.View>;
}
