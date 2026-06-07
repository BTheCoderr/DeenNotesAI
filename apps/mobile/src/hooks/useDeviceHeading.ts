import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export type DeviceHeadingState = {
  heading: number | null;
  available: boolean;
  error: string | null;
};

function magnetometerToHeading(x: number, y: number): number {
  let angle =
    Platform.OS === "ios"
      ? Math.atan2(-x, y) * (180 / Math.PI)
      : Math.atan2(y, x) * (180 / Math.PI);
  return (angle + 360) % 360;
}

/**
 * Foreground magnetometer heading in degrees clockwise from magnetic north.
 * Requires a physical device for meaningful readings — simulators stay null.
 */
export function useDeviceHeading(active = true): DeviceHeadingState {
  const [heading, setHeading] = useState<number | null>(null);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (cancelled) return;
        if (!isAvailable) {
          setAvailable(false);
          setError("Compass sensors are not available on this device.");
          return;
        }
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener(({ x, y }) => {
          setHeading(magnetometerToHeading(x, y));
        });
      } catch {
        if (!cancelled) {
          setAvailable(false);
          setError("Could not read compass sensors.");
        }
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active]);

  return { heading, available, error };
}
