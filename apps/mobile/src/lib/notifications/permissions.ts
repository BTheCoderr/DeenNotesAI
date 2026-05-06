import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const RECORD_KEY = "deennotes.mobile.notifications.permissionRecord.v1";

export type NotificationPermissionRecord = {
  status: Notifications.PermissionStatus;
  updatedAtEpochMs: number;
};

export async function readNotificationPermissionRecord(): Promise<NotificationPermissionRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(RECORD_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<NotificationPermissionRecord>;
    if (typeof o.status === "string" && typeof o.updatedAtEpochMs === "number") {
      return o as NotificationPermissionRecord;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeNotificationPermissionRecord(
  status: Notifications.PermissionStatus,
): Promise<void> {
  const row: NotificationPermissionRecord = { status, updatedAtEpochMs: Date.now() };
  await AsyncStorage.setItem(RECORD_KEY, JSON.stringify(row));
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  await writeNotificationPermissionRecord(existing);
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: false,
      allowBadge: false,
    },
  });
  await writeNotificationPermissionRecord(status);
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Persists the last known system status for Settings copy (read with `readNotificationPermissionRecord`). */
export async function syncNotificationPermissionRecord(): Promise<NotificationPermissionRecord> {
  const { status } = await Notifications.getPermissionsAsync();
  const row: NotificationPermissionRecord = { status, updatedAtEpochMs: Date.now() };
  await AsyncStorage.setItem(RECORD_KEY, JSON.stringify(row));
  return row;
}
