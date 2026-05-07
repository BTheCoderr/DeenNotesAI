import { Platform } from "react-native";

import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import Purchases from "react-native-purchases";

import { getPremiumEntitlementId, getRevenueCatIosApiKey } from "./expo-extra";

let configured = false;

export function isRevenueCatAvailable(): boolean {
  return Platform.OS === "ios" && Boolean(getRevenueCatIosApiKey());
}

/** Best-effort; safe no-op when key absent or Android (iOS storefront primary). */
export async function configureRevenueCatBootstrap(): Promise<void> {
  if (configured || !isRevenueCatAvailable()) return;
  const apiKey = getRevenueCatIosApiKey();
  await Purchases.configure({ apiKey });
  Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.ERROR);
  configured = true;
}

export function isPurchasesConfigured(): boolean {
  return configured;
}

export function premiumActiveFromCustomerInfo(info: CustomerInfo | null): boolean {
  if (!info) return false;
  const id = getPremiumEntitlementId();
  return Boolean(info.entitlements.active[id]?.isActive);
}

export async function fetchCustomerInfoSafe(): Promise<CustomerInfo | null> {
  try {
    if (!isPurchasesConfigured()) return null;
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function logoutRevenueCatIfConfigured(): Promise<void> {
  try {
    if (!isPurchasesConfigured()) return;
    await Purchases.logOut();
  } catch {
    /* ignore logout noise */
  }
}

export async function loginRevenueCatWithUserId(appUserId: string): Promise<void> {
  try {
    await configureRevenueCatBootstrap();
    if (!isPurchasesConfigured()) return;
    await Purchases.logIn(appUserId);
  } catch {
    /* anon continues */
  }
}

export async function restorePurchasesNative(): Promise<CustomerInfo> {
  await configureRevenueCatBootstrap();
  if (!isPurchasesConfigured()) {
    throw new Error("Subscriptions are unavailable in this build.");
  }
  return Purchases.restorePurchases();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  await configureRevenueCatBootstrap();
  if (!isPurchasesConfigured()) throw new Error("Subscriptions are unavailable.");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}
