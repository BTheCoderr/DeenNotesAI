import * as Location from "expo-location";

import { LOCATION_FALLBACK } from "../contracts/prayer-preferences";

import type { MobilePrayerLocationPrefs } from "./mobile-prayer-prefs";
import {
  readMobilePrayerLocationPrefs,
  writeMobilePrayerLocationPrefs,
} from "./mobile-prayer-prefs";

function defaultPrefs(): MobilePrayerLocationPrefs {
  return {
    locationMode: "manual",
    city: LOCATION_FALLBACK.city,
    country: LOCATION_FALLBACK.country,
    region: LOCATION_FALLBACK.region,
    method: 2,
    school: 0,
  };
}

/** Foreground permission only; no background tracking. */
export async function requestForegroundLocationPermission(): Promise<Location.PermissionStatus> {
  const r = await Location.requestForegroundPermissionsAsync();
  return r.status;
}

export async function getForegroundPermissionStatus(): Promise<Location.PermissionStatus> {
  const r = await Location.getForegroundPermissionsAsync();
  return r.status;
}

/**
 * Reads device coordinates when permission is granted; returns null otherwise.
 */
export async function fetchDeviceCoordinates(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return null;
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };
}

/**
 * Gentle flow: request permission → fetch coords → persist for device mode.
 * If denied, clear coordinates and keep manual city/country for queries.
 */
export async function refreshStoredDeviceLocation(): Promise<{
  prefs: MobilePrayerLocationPrefs;
  permission: Location.PermissionStatus;
}> {
  const prev = (await readMobilePrayerLocationPrefs()) ?? defaultPrefs();

  const status = await requestForegroundLocationPermission();
  if (status !== Location.PermissionStatus.GRANTED) {
    const prefs: MobilePrayerLocationPrefs = {
      ...prev,
      locationMode: "manual",
      latitude: undefined,
      longitude: undefined,
    };
    await writeMobilePrayerLocationPrefs(prefs);
    return { prefs, permission: status };
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const prefs: MobilePrayerLocationPrefs = {
    ...prev,
    locationMode: "device",
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };
  await writeMobilePrayerLocationPrefs(prefs);
  return { prefs, permission: status };
}
